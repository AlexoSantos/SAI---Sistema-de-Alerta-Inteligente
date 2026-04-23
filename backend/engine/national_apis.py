import random
import datetime

class NationalWeatherAPI:
    """
    Classe para integrar fontes governamentais e gratuitas:
    INMET, CEMADEN, Climagro, e dados brutos do Windy/Ventusky.
    """
    
    def __init__(self):
        # Base URLs para APIs reais na Versão em Produção
        self.inmet_base_url = "https://apitempo.inmet.gov.br"
        self.cemaden_base_url = "http://api.cemaden.gov.br"
        
    def fetch_all_sources(self, lat: float, lng: float):
        """
        Retorna um consolidado das APIs nacionais e serviços gratuitos para a coordenada.
        """
        return {
            "inmet": self._get_inmet_data(lat, lng),
            "cemaden": self._get_cemaden_data(lat, lng),
            "climagro": self._get_climagro_data(lat, lng),
            "windy_summary": self._get_windy_data(lat, lng),
            "ventusky_summary": self._get_ventusky_data(lat, lng)
        }

    def _get_inmet_data(self, lat: float, lng: float):
        """Mock da API do Instituto Nacional de Meteorologia."""
        # A API do INMET fornece dados em tempo real das estações automáticas.
        return {
            "source": "INMET",
            "temp_c": round(random.uniform(25.0, 32.0), 1),
            "humidity": random.randint(50, 90),
            "warning_active": random.choice([True, False, False]), # Avisos meteorológicos (Amarelo, Laranja, Vermelho)
            "warning_type": "Chuva Intensas" if random.random() > 0.7 else None
        }

    def _get_cemaden_data(self, lat: float, lng: float):
        """Mock da API do CEMADEN (Centro Nacional de Monitoramento e Alertas de Desastres Naturais)."""
        # Foco em pluviometria e risco de deslizamento/inundação
        return {
            "source": "CEMADEN",
            "pluviometer_24h_mm": round(random.uniform(0.0, 80.0), 1),
            "risk_level": random.choice(["BAIXO", "MODERADO", "ALTO"]),
            "soil_moisture_index": random.randint(40, 100) # Porcentagem de saturação do solo
        }

    def _get_climagro_data(self, lat: float, lng: float):
        """Agrometeorologia e dados agrícolas (Climagro/Cilagro)."""
        return {
            "source": "CLIMAGRO",
            "evapotranspiration": round(random.uniform(2.0, 6.0), 1),
            "soil_temp": round(random.uniform(22.0, 28.0), 1)
        }

    def _get_windy_data(self, lat: float, lng: float):
        """Resumo dos modelos de vento e precipitação do Windy."""
        return {
            "source": "WINDY",
            "wind_gusts_kmh": random.randint(15, 60),
            "dominant_model": "ECMWF"
        }

    def _get_ventusky_data(self, lat: float, lng: float):
        """Resumo da previsão atmosférica do Ventusky."""
        return {
            "source": "VENTUSKY",
            "cape_index": random.randint(500, 2500), # Índice de instabilidade atmosférica
            "thunderstorm_prob": random.randint(10, 80)
        }
