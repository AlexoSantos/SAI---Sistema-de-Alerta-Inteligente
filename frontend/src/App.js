import { useState, useEffect, Fragment } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, Activity, Database, AlertTriangle, Layers, Map as MapIcon, History } from 'lucide-react';
import L from 'leaflet';

// Corrigir ícone padrão do Leaflet no React (bundler strip)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
const API = `${BACKEND_URL}/api`;

function App() {
  const [activeLayer, setActiveLayer] = useState('telemetry');
  const [ibgeData, setIbgeData] = useState([]);
  const [externalData, setExternalData] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  // Busca inicial de todas as fontes
  useEffect(() => {
    fetch(`${API}/stations`)
      .then(res => res.json())
      .then(data => {
        const list = data.stations || [];
        setStations(list);
        if (list.length > 0) setSelectedStation(list[0]);
      })
      .catch(err => console.error('Erro ao buscar estações:', err));

    fetch(`${API}/ibge/history`)
      .then(res => res.json())
      .then(data => setIbgeData(data || []))
      .catch(err => console.error('Erro IBGE:', err));

    fetch(`${API}/external-sources?lat=-21.9696&lng=-46.7916`)
      .then(res => res.json())
      .then(data => setExternalData(data))
      .catch(err => console.error('Erro APIs Nacionais:', err));
  }, []);

  // Refresh periódico das estações
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API}/stations`)
        .then(res => res.json())
        .then(data => {
          const list = data.stations || [];
          setStations(list);
          if (list.length > 0) {
            setSelectedStation(prev => {
              if (!prev) return list[0];
              return list.find(s => s.id === prev.id) || list[0];
            });
          }
        })
        .catch(err => console.error('Erro ao atualizar estações:', err));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleDispararAlerta = () => {
    if (!selectedStation) return;
    const ttc = selectedStation.timeToCritical ?? 'N/A';
    if (window.confirm(`CONFIRMACAO DE EMERGENCIA\n\nTempo estimado para transbordamento: ${ttc} min.\nDeseja acionar as sirenes?`)) {
      alert('Sirenes acionadas. Defesa Civil notificada.');
    }
  };

  const criticalStation = stations.find(s => s.status === 'CRITICAL');

  return (
    <div className="app-container" data-testid="sai-app">
      {/* FULLSCREEN MAP */}
      <div className="map-fullscreen">
        {activeLayer === 'windy' ? (
          <iframe
            width="100%"
            height="100%"
            src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=13&overlay=rain&product=ecmwf&level=surface&lat=-21.969&lon=-46.791"
            frameBorder="0"
            title="Windy Radar"
            data-testid="windy-iframe"
          />
        ) : (
          <MapContainer center={[-21.9696, -46.7916]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {activeLayer === 'telemetry' && stations.map(st => (
              <Fragment key={st.id}>
                <Circle
                  center={[st.lat, st.lng]}
                  radius={800}
                  pathOptions={{
                    color: st.status === 'CRITICAL' ? 'red' : st.status === 'WARNING' ? 'orange' : '#38bdf8',
                    fillColor: st.status === 'CRITICAL' ? '#f03' : st.status === 'WARNING' ? '#f90' : '#38bdf8',
                    fillOpacity: 0.3,
                  }}
                />
                <Marker
                  position={[st.lat, st.lng]}
                  eventHandlers={{ click: () => setSelectedStation(st) }}
                >
                  <Popup>
                    <strong>{st.name}</strong><br />Nivel: {st.riverLevel} cm
                  </Popup>
                </Marker>
              </Fragment>
            ))}

            {activeLayer === 'ibge' && ibgeData.map((bairro, idx) => {
              const coords = [
                [-21.969, -46.791],
                [-21.975, -46.780],
                [-21.960, -46.800],
                [-21.980, -46.795],
                [-21.955, -46.785],
              ][idx % 5];
              return (
                <Circle
                  key={bairro.neighborhood}
                  center={coords}
                  radius={1000}
                  pathOptions={{
                    color: bairro.risk_index > 50 ? 'red' : 'orange',
                    fillOpacity: Math.min(bairro.risk_index / 100, 0.7),
                  }}
                >
                  <Popup>
                    <strong>{bairro.neighborhood}</strong><br />
                    Risco: {bairro.risk_index}%<br />
                    Eventos (5 anos): {bairro.total_events_5y}
                  </Popup>
                </Circle>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* FLOATING PANEL */}
      <div className="floating-panel" data-testid="floating-panel">
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
              {!selectedStation && (
                <div className="loading-state" data-testid="loading-stations">Carregando estacoes...</div>
              )}

              {selectedStation && (
                <>
                  <div className="info-card" data-testid="station-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 600 }}>Status da Estacao</span>
                      <span className={`status-badge status-${(selectedStation.status || 'safe').toLowerCase()}`} data-testid="status-badge">
                        {selectedStation.status === 'CRITICAL' ? 'ALERTA CRITICO' : selectedStation.status === 'WARNING' ? 'ATENCAO' : 'NORMAL'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.2rem', margin: '5px 0' }}>{selectedStation.name}</h3>
                  </div>

                  {selectedStation.status === 'CRITICAL' && (
                    <div className="info-card" style={{ background: 'rgba(231, 76, 60, 0.2)', borderColor: '#e74c3c' }}>
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff6b6b', marginBottom: '10px' }}>
                        <AlertTriangle size={20} /> PREVISAO ENSEMBLE
                      </h4>
                      <p style={{ fontSize: '0.9rem' }}>
                        Transbordamento em <b>~{selectedStation.timeToCritical} min</b> baseado em precipitacao de {selectedStation.rainVol}mm.
                      </p>
                    </div>
                  )}

                  <div className="info-card">
                    <div className="card-header"><Activity size={18} /> Telemetria (Tempo Real)</div>
                    <div className="stat-grid">
                      <div className="stat-box">
                        <span className="stat-label">Nivel do Rio</span>
                        <span className="stat-value" style={{ color: selectedStation.riverLevel > 300 ? '#ff6b6b' : 'var(--text-primary)' }} data-testid="river-level">
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
                    <button className="btn-danger" onClick={handleDispararAlerta} data-testid="btn-sirenes">
                      ACIONAR SIRENES (CELL BROADCAST)
                    </button>
                  </div>

                  {stations.length > 1 && (
                    <div className="info-card">
                      <div className="card-header"><MapIcon size={18} /> Todas as Estacoes</div>
                      <div className="history-list">
                        {stations.map(s => (
                          <div
                            key={s.id}
                            className="history-item"
                            style={{ cursor: 'pointer', background: s.id === selectedStation.id ? 'rgba(56,189,248,0.1)' : 'transparent' }}
                            onClick={() => setSelectedStation(s)}
                            data-testid={`station-item-${s.id}`}
                          >
                            <span>{s.name}</span>
                            <span className={`status-badge status-${s.status.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '3px 8px' }}>
                              {s.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {activeLayer === 'ibge' && (
            <div className="info-card" style={{ borderColor: '#f39c12' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f39c12', marginBottom: '15px' }}>
                <History size={20} /> Historico IBGE (5 Anos)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                Manchas de inundacao oficiais e indice de risco por bairro.
              </p>
              <div className="history-list">
                {ibgeData.map(b => (
                  <div key={b.neighborhood} className="history-item">
                    <span>{b.neighborhood}</span>
                    <span style={{ color: b.risk_index > 50 ? '#e74c3c' : '#f1c40f', fontWeight: 'bold' }}>
                      {b.total_events_5y} Eventos
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeLayer === 'nacional' && externalData && (
            <>
              <div className="info-card" style={{ borderColor: '#27ae60' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#27ae60', marginBottom: '15px' }}>
                  <Database size={20} /> INMET Oficial
                </h3>
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Temperatura</span>
                    <span className="stat-value">{externalData.inmet?.temp_c}°C</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Aviso</span>
                    <span className="stat-value" style={{ color: '#f39c12', fontSize: '0.9rem' }}>
                      {externalData.inmet?.warning_type || 'NENHUM'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="info-card" style={{ borderColor: '#2980b9' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2980b9', marginBottom: '15px' }}>
                  <ShieldAlert size={20} /> CEMADEN
                </h3>
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Risco</span>
                    <span className="stat-value">{externalData.cemaden?.risk_level}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Chuva 24h</span>
                    <span className="stat-value">{externalData.cemaden?.pluviometer_24h_mm}mm</span>
                  </div>
                </div>
              </div>
              <div className="info-card" style={{ borderColor: '#8e44ad' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8e44ad', marginBottom: '15px' }}>
                  <Layers size={20} /> Climagro
                </h3>
                <div className="stat-grid">
                  <div className="stat-box">
                    <span className="stat-label">Umidade Solo</span>
                    <span className="stat-value">{externalData.cemaden?.soil_moisture_index}%</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">Evapotrans.</span>
                    <span className="stat-value">{externalData.climagro?.evapotranspiration}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeLayer === 'windy' && (
            <div className="info-card" style={{ borderColor: '#38bdf8' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '15px' }}>
                <MapIcon size={20} /> Radares ECMWF
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Visualizando correntes de vento e acumulo de precipitacao ao vivo (modelos meteorologicos).
              </p>
            </div>
          )}

          {criticalStation && selectedStation?.id !== criticalStation.id && activeLayer === 'telemetry' && (
            <div
              className="info-card"
              style={{ background: 'rgba(231, 76, 60, 0.15)', borderColor: '#e74c3c', cursor: 'pointer' }}
              onClick={() => setSelectedStation(criticalStation)}
              data-testid="critical-alert-link"
            >
              <small style={{ color: '#ff6b6b', fontWeight: 600 }}>
                ALERTA: {criticalStation.name} em estado CRITICO. Clique para ver.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* LAYER CONTROLS */}
      <div className="layer-controls">
        <button
          className={`layer-btn ${activeLayer === 'telemetry' ? 'active' : ''}`}
          onClick={() => setActiveLayer('telemetry')}
          data-testid="layer-telemetry"
        >
          <Activity size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Sensores IoT
        </button>
        <button
          className={`layer-btn ${activeLayer === 'ibge' ? 'active' : ''}`}
          onClick={() => setActiveLayer('ibge')}
          data-testid="layer-ibge"
        >
          <History size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Historico IBGE
        </button>
        <button
          className={`layer-btn ${activeLayer === 'nacional' ? 'active' : ''}`}
          onClick={() => setActiveLayer('nacional')}
          data-testid="layer-nacional"
        >
          <Database size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> APIs Nacionais
        </button>
        <button
          className={`layer-btn ${activeLayer === 'windy' ? 'active' : ''}`}
          onClick={() => setActiveLayer('windy')}
          data-testid="layer-windy"
        >
          <Layers size={16} style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Radares Windy
        </button>
      </div>
    </div>
  );
}

export default App;
