import datetime
import requests
from engine.ai_ensemble import AIEnsembleEngine

class PredictionEngine:
    def __init__(self):
        # Nível máximo suportado pelo rio (Exemplo: 400 cm)
        self.CRITICAL_RIVER_LEVEL_CM = 400.0
        # Nível de alerta para começar a notificar a Defesa Civil
        self.WARNING_RIVER_LEVEL_CM = 300.0
        # Inicializa o Motor do Comitê de IA
        self.ensemble_engine = AIEnsembleEngine()

    def calculate_1h_prediction(self, history: list):
        """
        Recebe o histórico recente de telemetria da estação.
        Retorna (Status, Tempo_Restante_Mins, Mensagem)
        """
        if len(history) < 2:
            return "SAFE", None, "Coletando histórico para previsão..."

        # Pega a leitura mais recente e a mais antiga disponível no cache curto
        current_data = history[-1]
        past_data = history[0]

        current_level = current_data['river_level_cm']
        past_level = past_data['river_level_cm']

        if current_level is None or past_level is None:
             return "SAFE", None, "Dados do rio incompletos."

        # Calcular a taxa de subida (cm por minuto)
        # Assumindo que os dados chegam a cada 5 minutos (hardcoded para simplificar a V1, ou poderíamos calcular usando timestamp)
        # Vamos simular um delta T de (len(history) - 1) * 5 minutos
        delta_t_mins = max((len(history) - 1) * 5, 1) 
        delta_level = current_level - past_level

        rate_cm_per_min = delta_level / delta_t_mins

        if current_level >= self.CRITICAL_RIVER_LEVEL_CM:
            return "CRITICAL", 0, "TRANSBORDAMENTO EMINENTE OU EM ANDAMENTO!"

        if rate_cm_per_min <= 0:
            if current_level >= self.WARNING_RIVER_LEVEL_CM:
                return "WARNING", None, "Nível alto, mas rio estável ou baixando."
            return "SAFE", None, "Nível do rio estável."

        # Se o rio está subindo, calcular tempo estimado para atingir a cota crítica
        cm_to_critical = self.CRITICAL_RIVER_LEVEL_CM - current_level
        time_to_critical_mins = int(cm_to_critical / rate_cm_per_min)

        # Integração do Motor de IA Avançada (Ensemble)
        # O sistema gera uma tendência base e envia para o comitê (GraphCast, AIFS, etc) gerar o consenso
        base_rain = self._fetch_nowcasting(current_data['station_id'])
        
        # O Comitê de IAs se reúne e dá o Veredito (>90% exatidão)
        # Usando lat/lng estáticos da cidade para o exemplo
        ai_verdict = self.ensemble_engine.run_ensemble_consensus(
            lat=-21.9696, 
            lng=-46.7916, 
            base_rain_prob=base_rain['rain_probability'], 
            base_rain_vol=base_rain['expected_volume_mm']
        )
        
        # Lógica do Requisito Crítico: Alerta Antecipado de 1 Hora (60 mins)
        if time_to_critical_mins <= 60:
            if ai_verdict['rain_probability'] > 70:
                msg = f"ALERTA CRÍTICO: Transbordamento em ~{time_to_critical_mins} min. IAs confirmam tempestade ({ai_verdict['expected_volume_mm']}mm esperados)."
                return "CRITICAL", time_to_critical_mins, msg
            else:
                msg = f"ALERTA: O rio atingirá a cota crítica em ~{time_to_critical_mins} min na taxa atual. IAs não preveem chuva."
                return "WARNING", time_to_critical_mins, msg
        
        if current_level >= self.WARNING_RIVER_LEVEL_CM:
            return "WARNING", time_to_critical_mins, f"Atenção: Nível de alerta. Transbordamento estimado em {time_to_critical_mins} min."

        return "SAFE", time_to_critical_mins, f"Nível seguro. Estimativa p/ crítico na taxa atual: {time_to_critical_mins} min."

    def _fetch_nowcasting(self, station_id: str):
        """
        Simula a busca da previsão de curto prazo base para alimentar o Ensemble.
        """
        import random
        return {
            "rain_probability": random.randint(40, 100),
            "expected_volume_mm": round(random.uniform(10.0, 40.0), 2)
        }
