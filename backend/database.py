import os
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

# Pega a URL do Neon nas Variáveis de Ambiente da Vercel. 
# Se não achar (rodando local sem config), cria um sqlite local pra não quebrar.
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:////tmp/local_db.db")

# Ajuste necessário para SQLAlchemy funcionar com as URLs postgres:// padrão de algumas plataformas
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL, 
    # check_same_thread apenas para SQLite local. Removido se for Postgres.
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Tabela para salvar os Leads (Prefeituras interessadas)
class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String)
    telefone = Column(String)
    cidade = Column(String)
    data_contato = Column(DateTime, default=datetime.datetime.utcnow)

# Tabela para salvar dados de telemetria das estações
class Telemetry(Base):
    __tablename__ = "telemetry"
    
    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(String, index=True)
    temperature = Column(Float)
    humidity = Column(Float)
    pressure = Column(Float)
    rain_volume_mm = Column(Float)
    wind_speed_kmh = Column(Float)
    river_level_cm = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
