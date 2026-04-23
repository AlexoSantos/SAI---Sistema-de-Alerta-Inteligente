import random

class IBGEHistoryData:
    """
    Classe para carregar dados históricos de inundações do IBGE e Defesa Civil.
    Gera dados simulados hiper-realistas para São João da Boa Vista
    como Prova de Conceito (PoC). Os dados reais serão inseridos pelo cliente.
    """
    def __init__(self):
        # Principais bairros de São João da Boa Vista cortados pelo Rio Jaguari Mirim ou córregos
        self.neighborhoods = [
            "Centro", "Vila Zanetti", "Jardim São Paulo", 
            "Bairro DER", "Vila Primeiro de Maio"
        ]
        self.years = [2021, 2022, 2023, 2024, 2025]

    def get_historical_flood_data(self):
        """
        Retorna as estatísticas de ocorrências de enchentes nos últimos 5 anos.
        """
        data = []
        for nb in self.neighborhoods:
            history = []
            total_occurrences = 0
            for year in self.years:
                # Simulando ocorrências baseadas em probabilidade aleatória
                # Centro e Vila Zanetti historicamente sofrem mais na simulação
                base_prob = 3 if nb in ["Centro", "Vila Zanetti"] else 1
                occurrences = random.randint(0, base_prob)
                total_occurrences += occurrences
                
                history.append({
                    "year": year,
                    "flood_events": occurrences,
                    "avg_water_level_cm": random.randint(15, 80) if occurrences > 0 else 0
                })
            
            data.append({
                "neighborhood": nb,
                "risk_index": round((total_occurrences / 15.0) * 100, 1), # Índice de risco %
                "total_events_5y": total_occurrences,
                "history": history
            })
            
        return data
