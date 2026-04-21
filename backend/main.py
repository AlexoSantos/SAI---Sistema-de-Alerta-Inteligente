from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import datetime
import random

# Import da engine de previsão e APIs nacionais
from engine.prediction import PredictionEngine
from engine.national_apis import NationalWeatherAPI
from engine.ibge_history import IBGEHistoryData
from routes import leads

app = FastAPI(title="SAI API", version="1.0.0")

app.include_router(leads.router)

# Configurar CORS para o frontend em React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Para desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = PredictionEngine()
national_api = NationalWeatherAPI()

# Modelos de Dados Pydantic
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
    status: str # "SAFE", "WARNING", "CRITICAL"
    estimated_time_to_overflow_mins: Optional[int]
    message: str

# Banco de dados em memória para V1 (será substituído por SQLite/Postgres)
stations_data = {}

@app.get("/")
def read_root():
    return {"message": "SAI API is running"}

@app.post("/api/telemetry", response_model=AlertResponse)
def receive_telemetry(data: TelemetryData):
    """
    Endpoint chamado pelo ESP32 a cada X minutos.
    Recebe os dados climáticos e de nível do rio.
    """
    if data.timestamp is None:
        data.timestamp = datetime.datetime.now().isoformat()
        
    if data.station_id not in stations_data:
        stations_data[data.station_id] = []
        
    stations_data[data.station_id].append(data.dict())
    
    # Manter apenas as últimas 10 leituras na memória
    if len(stations_data[data.station_id]) > 10:
        stations_data[data.station_id].pop(0)
        
    # Acionar motor de previsão de 1 Hora se houver sensor de rio
    if data.river_level_cm is not None:
        history = stations_data[data.station_id]
        status, time_left, msg = engine.calculate_1h_prediction(history)
        
        return AlertResponse(
            station_id=data.station_id,
            status=status,
            estimated_time_to_overflow_mins=time_left,
            message=msg
        )
    
    return AlertResponse(
        station_id=data.station_id,
        status="SAFE",
        estimated_time_to_overflow_mins=None,
        message="Dados climáticos recebidos com sucesso."
    )

@app.get("/api/stations/{station_id}/history")
def get_station_history(station_id: str):
    if station_id not in stations_data:
        raise HTTPException(status_code=404, detail="Station not found")
    return {"station_id": station_id, "history": stations_data[station_id]}

@app.get("/api/mock/nowcasting")
def get_mock_nowcasting(lat: float, lng: float):
    """
    Simula uma API meteorológica de curto prazo (Nowcasting).
    Retorna a probabilidade e o volume de chuva para os próximos 60 min.
    """
    # Para testes, geramos valores aleatórios pesados caso a chuva esteja ocorrendo
    return {
        "lat": lat,
        "lng": lng,
        "next_60_min": {
            "rain_probability": random.randint(40, 100),
            "expected_volume_mm": round(random.uniform(5.0, 50.0), 2)
        }
    }

@app.get("/api/external-sources")
def get_external_sources(lat: float, lng: float):
    """
    Retorna o consolidado de APIs externas gratuitas (INMET, CEMADEN, Climagro, Windy, Ventusky).
    """
    return national_api.fetch_all_sources(lat, lng)

ibge_data = IBGEHistoryData()

@app.get("/api/ibge/history")
def get_ibge_history():
    """
    Retorna o histórico de enchentes dos últimos 5 anos simulado (Prova de Conceito).
    """
    return ibge_data.get_historical_flood_data()
