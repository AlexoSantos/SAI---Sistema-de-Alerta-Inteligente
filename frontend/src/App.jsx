import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Activity, Database, AlertTriangle, Layers, Map as MapIcon, History } from 'lucide-react';
import L from 'leaflet';

// Corrigir ícone padrão do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function App() {
  const [activeLayer, setActiveLayer] = useState('telemetry'); // 'telemetry', 'ibge', 'windy', 'nacional'
  const [ibgeData, setIbgeData] = useState([]);
  const [externalData, setExternalData] = useState(null);

  const [stations, setStations] = useState([
    {
      id: 'ST-001',
      name: 'Ponte Central (Rio Jaguari)',
      lat: -21.9696,
      lng: -46.7916,
      status: 'SAFE',
      riverLevel: 120, // cm
      rainProb: 20,
      rainVol: 0,
      timeToCritical: null
    }
  ]);

  const [selectedStation, setSelectedStation] = useState(stations[0]);

  // URL da API baseada no ambiente (Local ou Produção Vercel)
  const apiUrl = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000');

  // Busca dados Mockados do IBGE no backend
  useEffect(() => {
    fetch(`${apiUrl}/api/ibge/history`)
      .then(res => res.json())
      .then(data => setIbgeData(data))
      .catch(err => console.error("Erro IBGE:", err));

    // Busca as APIs Nacionais Integradas
    fetch(`${apiUrl}/api/external-sources?lat=-21.9696&lng=-46.7916`)
      .then(res => res.json())
      .then(data => setExternalData(data))
      .catch(err => console.error("Erro APIs Nacionais:", err));
  }, []);

  // Simulação de Polling (Rio subindo)
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(st => {
        if (st.id === 'ST-001') {
          const newLevel = st.riverLevel + 15;
          let newStatus = 'SAFE';
          let time = null;
          let rain = st.rainProb;

          if (newLevel > 280) {
            newStatus = 'CRITICAL';
            time = Math.max(10, 60 - Math.floor((newLevel - 280) / 2));
            rain = 85;
          } else if (newLevel > 200) {
            newStatus = 'WARNING';
            time = 120;
            rain = 60;
          }

          const updated = { ...st, riverLevel: newLevel, status: newStatus, timeToCritical: time, rainProb: rain, rainVol: rain > 70 ? 25.4 : 5.2 };
          if (selectedStation?.id === st.id) setSelectedStation(updated);
          return updated;
        }
        return st;
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedStation]);

  const handleDispararAlerta = () => {
    if (window.confirm(`⚠️ CONFIRMAÇÃO DE EMERGÊNCIA\n\nTempo estimado para transbordamento: ${selectedStation.timeToCritical || 'N/A'} min.\nDeseja acionar as sirenes?`)) {
      alert("Sirenes acionadas. Defesa Civil notificada.");
    }
  };

  return (
    <div className="app-container">

      {/* 100% FULLSCREEN MAP BACKGROUND */}
      <div className="map-fullscreen">
        {activeLayer === 'windy' ? (
          <iframe
            width="100%"
            height="100%"
            src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=13&overlay=rain&product=ecmwf&level=surface&lat=-21.969&lon=-46.791"
            frameBorder="0"
            title="Windy Radar">
          </iframe>
        ) : (
          <MapContainer center={[-21.9696, -46.7916]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeLayer === 'telemetry' && stations.map(st => (
              <div key={st.id}>
                <Circle center={[st.lat, st.lng]} radius={800} pathOptions={{
                  color: st.status === 'CRITICAL' ? 'red' : st.status === 'WARNING' ? 'orange' : '#38bdf8',
                  fillColor: st.status === 'CRITICAL' ? '#f03' : st.status === 'WARNING' ? '#f90' : '#38bdf8',
                  fillOpacity: 0.3
                }}
                />
                <Marker position={[st.lat, st.lng]} eventHandlers={{ click: () => setSelectedStation(st) }}>
                  <Popup><strong>{st.name}</strong><br />Nível: {st.riverLevel} cm</Popup>
                </Marker>
              </div>
            ))}

            {activeLayer === 'ibge' && ibgeData.map((bairro, idx) => {
              // Mocking coordenadas baseadas no nome do bairro para visualização
              const coords = [
                [-21.969, -46.791], [-21.975, -46.780], [-21.960, -46.800], [-21.980, -46.795], [-21.955, -46.785]
              ][idx % 5];
              return (
                <Circle key={bairro.neighborhood} center={coords} radius={1000} pathOptions={{
                  color: bairro.risk_index > 50 ? 'red' : 'orange',
                  fillOpacity: bairro.risk_index / 100
                }}
                >
                  <Popup>
                    <strong>{bairro.neighborhood}</strong><br />
                    Risco: {bairro.risk_index}%<br />
                    Eventos (5 anos): {bairro.total_events_5y}
                  </Popup>
                </Circle>
              )
            })}
          </MapContainer>
        )}
      </div>

      {/* FLOATING GLASS PANEL (LEFT) */}
      <div className="floating-panel">
        <div className="panel-header">
          <ShieldAlert size={28} color="#38bdf8" />
          <div>
            <h1>SAI Sistema de Alerta Inteligente</h1>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Comando Defesa Civil - SJBV</span>
          </div>
        </div>

        <div className="panel-content">
          {activeLayer === 'telemetry' && (
            <>
              <div className="info-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 600 }}>Status da Estação</span>
                  <span className={`status-badge status-${selectedStation.status.toLowerCase()}`}>
                    {selectedStation.status === 'CRITICAL' ? 'ALERTA CRÍTICO' : selectedStation.status === 'WARNING' ? 'ATENÇÃO' : 'NORMAL'}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: '5px 0' }}>{selectedStation.name}</h3>
              </div>

              {selectedStation.status === 'CRITICAL' && (
                <div className="info-card" style={{ background: 'rgba(231, 76, 60, 0.2)', borderColor: '#e74c3c' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', marginBottom: '10px' }}><AlertTriangle size={20} /> PREVISÃO ENSEMBLE</h4>
                  <p style={{ fontSize: '0.9rem' }}>Transbordamento em <b>~{selectedStation.timeToCritical} min</b> baseado em precipitação de {selectedStation.rainVol}mm.</p>
                </div>
              )}

              <div className="info-card">
                <div className="card-header"><Activity size={18} /> Telemetria (Tempo Real)</div>
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Nível do Rio</span>
                    <span className="stat-value" style={{ color: selectedStation.riverLevel > 300 ? '#ff6b6b' : 'var(--text-primary)' }}>
                      {selectedStation.riverLevel} cm
                    </span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Chuva (IA)</span>
                    <span className="stat-value">{selectedStation.rainProb}%</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '10px' }}>
                <button className="btn-danger" onClick={handleDispararAlerta}>
                  ACIONAR SIRENES (CELL BROADCAST)
                </button>
              </div>
            </>
          )}

          {activeLayer === 'ibge' && (
            <>
              <div className="info-card" style={{ borderColor: '#f39c12' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f39c12', marginBottom: '15px' }}><History size={20} /> Histórico IBGE (5 Anos)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  Manchas de inundação oficiais e índice de risco por bairro.
                </p>
                <div className="history-list">
                  {ibgeData.map(b => (
                    <div key={b.neighborhood} className="history-item">
                      <span>{b.neighborhood}</span>
                      <span style={{ color: b.risk_index > 50 ? '#e74c3c' : '#f1c40f', fontWeight: 'bold' }}>{b.total_events_5y} Eventos</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeLayer === 'nacional' && externalData && (
            <>
              <div className="info-card" style={{ borderColor: '#27ae60' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#27ae60', marginBottom: '15px' }}><Database size={20} /> INMET Oficial</h3>
                <div className="stat-grid">
                  <div className="stat-box"><span className="stat-label">Temperatura</span><span className="stat-value">{externalData.inmet?.temp_c}°C</span></div>
                  <div className="stat-box"><span className="stat-label">Aviso</span><span className="stat-value" style={{ color: '#f39c12', fontSize: '0.9rem' }}>{externalData.inmet?.warning_type || 'NENHUM'}</span></div>
                </div>
              </div>
              <div className="info-card" style={{ borderColor: '#2980b9' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2980b9', marginBottom: '15px' }}><ShieldAlert size={20} /> CEMADEN & IDAP</h3>
                <div className="stat-grid">
                  <div className="stat-box"><span className="stat-label">Risco de Desastre</span><span className="stat-value">{externalData.cemaden?.risk_level}</span></div>
                  <div className="stat-box"><span className="stat-label">Chuva 24h</span><span className="stat-value">{externalData.cemaden?.pluviometer_24h_mm}mm</span></div>
                </div>
              </div>
              <div className="info-card" style={{ borderColor: '#8e44ad' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8e44ad', marginBottom: '15px' }}><Layers size={20} /> Climagro</h3>
                <div className="stat-grid">
                  <div className="stat-box"><span className="stat-label">Umidade Solo</span><span className="stat-value">{externalData.cemaden?.soil_moisture_index}%</span></div>
                  <div className="stat-box"><span className="stat-label">Evapotranspiração</span><span className="stat-value">{externalData.climagro?.evapotranspiration}</span></div>
                </div>
              </div>
            </>
          )}

          {activeLayer === 'windy' && (
            <div className="info-card" style={{ borderColor: '#38bdf8' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '15px' }}><MapIcon size={20} /> Radares ECMWF</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Visualizando correntes de vento e acúmulo de precipitação ao vivo no mapa global interagindo diretamente com os modelos meteorológicos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* LAYER CONTROLS (BOTTOM RIGHT) */}
      <div className="layer-controls">
        <button className={`layer-btn ${activeLayer === 'telemetry' ? 'active' : ''}`} onClick={() => setActiveLayer('telemetry')}>
          <Activity size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Sensores IoT
        </button>
        <button className={`layer-btn ${activeLayer === 'ibge' ? 'active' : ''}`} onClick={() => setActiveLayer('ibge')}>
          <History size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Histórico IBGE
        </button>
        <button className={`layer-btn ${activeLayer === 'nacional' ? 'active' : ''}`} onClick={() => setActiveLayer('nacional')}>
          <Database size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> APIs Nacionais
        </button>
        <button className={`layer-btn ${activeLayer === 'windy' ? 'active' : ''}`} onClick={() => setActiveLayer('windy')}>
          <Layers size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Radares Ventusky
        </button>
      </div>

    </div>
  );
}

export default App;
