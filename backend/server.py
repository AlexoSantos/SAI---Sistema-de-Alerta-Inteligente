"""
SAI - Sistema de Alerta Inteligente
Backend FastAPI adaptado para rodar no supervisor da Emergent (porta 8001).
"""
import os
import sys
import random
import datetime
import logging
from pathlib import Path
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

# Carrega .env local
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Permite imports relativos (engine/, routes/, database)
sys.path.insert(0, str(ROOT_DIR))

# --- IA GEMINI (opcional) ---
_gemini_model = None
_gemini_key = os.environ.get("GEMINI_API_KEY")
if _gemini_key:
    try:
        import google.generativeai as genai
        genai.configure(api_key=_gemini_key)
        _gemini_model = genai.GenerativeModel("gemini-1.5-flash")
    except Exception as e:  # noqa: BLE001
        logging.warning("Gemini indisponível: %s", e)

# --- Projeto SAI ---
from database import SessionLocal, Telemetry, Base, engine as sa_engine, get_db  # noqa: E402
from engine.prediction import PredictionEngine  # noqa: E402
from engine.national_apis import NationalWeatherAPI  # noqa: E402
from engine.ibge_history import IBGEHistoryData  # noqa: E402
from routes import leads  # noqa: E402

# --- App ---
app = FastAPI(
    title="SAI - Sistema de Alerta Inteligente",
    description="API de Prevenção de Desastres - ImperaTech",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

prediction_engine = PredictionEngine()
national_api = NationalWeatherAPI()
ibge_data = IBGEHistoryData()

# Inclui rotas de leads (/api/leads)
app.include_router(leads.router)


# ------------------------- Schemas -------------------------
class TelemetryData(BaseModel):
    station_id: str
    temperature: float
    humidity: float
    pressure: float
    rain_volume_mm: float
    wind_speed_kmh: float
    river_level_cm: Optional[float] = None
    timestamp: Optional[str] = None


class AlertResponse(BaseModel):
    station_id: str
    status: str
    estimated_time_to_overflow_mins: Optional[int] = None
    message: str


# ------------------------- Seed -------------------------
SEED_STATIONS = [
    {
        "id": "SJBV-01",
        "name": "Estação Rio Jaguari - Centro",
        "lat": -21.9696,
        "lng": -46.7916,
        "river_level_cm": 180.0,
        "rain_volume_mm": 12.5,
    },
    {
        "id": "SJBV-02",
        "name": "Estação Vila Zanetti",
        "lat": -21.9750,
        "lng": -46.7800,
        "river_level_cm": 320.0,
        "rain_volume_mm": 28.4,
    },
    {
        "id": "SJBV-03",
        "name": "Estação Rosário",
        "lat": -21.9605,
        "lng": -46.8000,
        "river_level_cm": 410.0,
        "rain_volume_mm": 45.7,
    },
]


def seed_database() -> None:
    """Cria tabelas e popula dados de teste se o banco estiver vazio."""
    Base.metadata.create_all(bind=sa_engine)
    db = SessionLocal()
    try:
        if db.query(Telemetry).count() > 0:
            return
        now = datetime.datetime.now(datetime.timezone.utc)
        for st in SEED_STATIONS:
            # Cria um histórico de 5 leituras para cada estação (para o motor de previsão)
            for i in range(5):
                ts = now - datetime.timedelta(minutes=(5 - i) * 5)
                # Simula subida gradual do rio
                level_offset = (i - 2) * 3
                db.add(
                    Telemetry(
                        station_id=st["id"],
                        temperature=round(random.uniform(22.0, 30.0), 1),
                        humidity=round(random.uniform(55.0, 95.0), 1),
                        pressure=round(random.uniform(1005.0, 1015.0), 1),
                        rain_volume_mm=st["rain_volume_mm"] * (0.7 + 0.1 * i),
                        wind_speed_kmh=round(random.uniform(5.0, 35.0), 1),
                        river_level_cm=st["river_level_cm"] + level_offset,
                        timestamp=ts,
                    )
                )
        db.commit()
        logging.info("Banco populado com %d estações de teste.", len(SEED_STATIONS))
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    try:
        seed_database()
    except Exception as e:  # noqa: BLE001
        logging.exception("Falha no seed: %s", e)


# ------------------------- Rotas -------------------------
@app.get("/")
def read_root():
    return {"message": "SAI Sistema de Alerta Inteligente API is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }


@app.get("/api/analise-ia")
def gerar_analise_ia(prompt_usuario: str):
    if _gemini_model is None:
        raise HTTPException(status_code=503, detail="GEMINI_API_KEY não configurada.")
    response = _gemini_model.generate_content(prompt_usuario)
    return {"resposta": response.text}


@app.post("/api/telemetry", response_model=AlertResponse)
def receive_telemetry(data: TelemetryData, db: Session = Depends(get_db)):
    try:
        ts = (
            datetime.datetime.fromisoformat(data.timestamp)
            if data.timestamp
            else datetime.datetime.now(datetime.timezone.utc)
        )
        entry = Telemetry(
            station_id=data.station_id,
            temperature=data.temperature,
            humidity=data.humidity,
            pressure=data.pressure,
            rain_volume_mm=data.rain_volume_mm,
            wind_speed_kmh=data.wind_speed_kmh,
            river_level_cm=data.river_level_cm,
            timestamp=ts,
        )
        db.add(entry)
        db.commit()

        recent = (
            db.query(Telemetry)
            .filter(Telemetry.station_id == data.station_id)
            .order_by(Telemetry.timestamp.desc())
            .limit(10)
            .all()
        )
        history = [
            {
                "station_id": t.station_id,
                "river_level_cm": t.river_level_cm,
                "rain_volume_mm": t.rain_volume_mm,
                "timestamp": t.timestamp.isoformat(),
            }
            for t in reversed(recent)
        ]

        if data.river_level_cm is not None and len(history) >= 3:
            status, time_left, msg = prediction_engine.calculate_1h_prediction(history)
            return AlertResponse(
                station_id=data.station_id,
                status=status,
                estimated_time_to_overflow_mins=time_left,
                message=msg,
            )
        return AlertResponse(
            station_id=data.station_id,
            status="SAFE",
            estimated_time_to_overflow_mins=None,
            message="Dados climáticos recebidos com sucesso.",
        )
    except Exception as e:  # noqa: BLE001
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar telemetria: {e}")


@app.get("/api/stations/{station_id}/history")
def get_station_history(station_id: str, db: Session = Depends(get_db)):
    telemetry = (
        db.query(Telemetry)
        .filter(Telemetry.station_id == station_id)
        .order_by(Telemetry.timestamp.desc())
        .limit(10)
        .all()
    )
    history = [
        {
            "station_id": t.station_id,
            "temperature": t.temperature,
            "humidity": t.humidity,
            "pressure": t.pressure,
            "rain_volume_mm": t.rain_volume_mm,
            "wind_speed_kmh": t.wind_speed_kmh,
            "river_level_cm": t.river_level_cm,
            "timestamp": t.timestamp.isoformat(),
        }
        for t in reversed(telemetry)
    ]
    return {"station_id": station_id, "history": history}


@app.get("/api/stations")
def get_stations(db: Session = Depends(get_db)):
    """Lista estações com o último snapshot de telemetria."""
    # Subquery: último timestamp por estação
    subq = (
        db.query(
            Telemetry.station_id,
            func.max(Telemetry.timestamp).label("max_ts"),
        )
        .group_by(Telemetry.station_id)
        .subquery()
    )
    latest = (
        db.query(Telemetry)
        .join(
            subq,
            (Telemetry.station_id == subq.c.station_id)
            & (Telemetry.timestamp == subq.c.max_ts),
        )
        .all()
    )

    # Mapeia id -> metadados de seed (coords e nome legível)
    seed_by_id = {s["id"]: s for s in SEED_STATIONS}

    stations = []
    for t in latest:
        meta = seed_by_id.get(
            t.station_id,
            {"name": f"Estação {t.station_id}", "lat": -21.9696, "lng": -46.7916},
        )
        status = "SAFE"
        time_to_critical = None
        river = t.river_level_cm or 0
        if river > 400:
            status = "CRITICAL"
            time_to_critical = 10
        elif river > 300:
            status = "CRITICAL"
            time_to_critical = max(10, 60 - int((river - 300) / 2))
        elif river > 200:
            status = "WARNING"
            time_to_critical = 120

        stations.append(
            {
                "id": t.station_id,
                "name": meta["name"],
                "lat": meta["lat"],
                "lng": meta["lng"],
                "status": status,
                "riverLevel": round(river, 1),
                "rainProb": random.randint(40, 95),
                "rainVol": round(t.rain_volume_mm or 0, 1),
                "timeToCritical": time_to_critical,
            }
        )
    return {"stations": stations}


@app.get("/api/mock/nowcasting")
def get_mock_nowcasting(lat: float, lng: float):
    return {
        "lat": lat,
        "lng": lng,
        "next_60_min": {
            "rain_probability": random.randint(40, 100),
            "expected_volume_mm": round(random.uniform(5.0, 50.0), 2),
        },
    }


@app.get("/api/external-sources")
def get_external_sources(lat: float, lng: float):
    return national_api.fetch_all_sources(lat, lng)


@app.get("/api/ibge/history")
def get_ibge_history():
    return ibge_data.get_historical_flood_data()


@app.get("/api/init-db")
def init_database():
    try:
        Base.metadata.create_all(bind=sa_engine)
        return {"message": "Banco de dados inicializado com sucesso"}
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Erro ao inicializar banco: {e}")
