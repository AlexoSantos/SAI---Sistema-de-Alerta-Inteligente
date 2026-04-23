# PRD - SAI (Sistema de Alerta Inteligente) - Dono: Alexandro Oliveira dos Santos

## Problema original
Usuário tem um projeto público no GitHub (https://github.com/AlexoSantos/SAI---Sistema-de-Alerta-Inteligente)
e quer colocá-lo online e funcionando. Projeto é um Dashboard de Defesa Civil para São João da Boa
Vista (SJBV) que recebe telemetria de estações IoT ESP32 e cruza com dados IBGE e APIs meteorológicas
nacionais para antecipar enchentes.

## Arquitetura atual (rodando no preview Emergent)
- Frontend: React 19 (CRA + craco) + Leaflet (mapa OpenStreetMap) + react-leaflet 4.2.1 + lucide-react.
  Porta 3000 via supervisor.
- Backend: FastAPI + SQLAlchemy + SQLite (arquivo em /app/backend/sai_local.db) + google-generativeai (Gemini).
  Porta 8001 via supervisor. Todas as rotas sob prefixo /api.
- IoT (não deployado aqui): firmware ESP32 no repo do cliente envia POST /api/telemetry.

## O que foi implementado nesta sessão (23/04/2026)
- Clonado repo e copiado backend (engine/, routes/, database.py) para /app/backend.
- Criado /app/backend/server.py unificado com: health check, analise-ia (Gemini), telemetry POST/GET,
  stations listing (com status SAFE/WARNING/CRITICAL calculado por river_level_cm), mock nowcasting,
  external-sources (INMET/CEMADEN/Climagro/Windy/Ventusky mockados), IBGE history, init-db, leads.
- Seed automático na inicialização: 3 estações (SJBV-01 NORMAL, SJBV-02 CRITICAL, SJBV-03 CRITICAL)
  com histórico de 5 leituras cada para alimentar o motor de previsão.
- Frontend substituído: App.js com mapa fullscreen, painel flutuante glassmorphism,
  4 camadas (Sensores IoT, Histórico IBGE, APIs Nacionais, Radares Windy via iframe).
  index.css com tema Dark Operations Center.
- Removido React.StrictMode do index.js (evita double-init do Leaflet).
- Corrigido bug de <div> dentro de <MapContainer> (substituído por Fragment com key).
- Dependências adicionadas: sqlalchemy 2.0.36, psycopg2-binary 2.9.10, google-generativeai 0.8.3,
  leaflet 1.9.4, react-leaflet 4.2.1.
- Variáveis de ambiente em /app/backend/.env: DATABASE_URL (sqlite), GEMINI_API_KEY.

## Integrações
- Gemini API (google-generativeai 0.8.3) - usando chave fornecida pelo usuário em /api/analise-ia.
- Banco: SQLite local (fallback). Migração futura para Postgres/Neon/Supabase é 1 var de ambiente.

## Endpoints principais (todos sob /api)
- GET  /api/health
- GET  /api/stations          -> lista estações com status
- POST /api/telemetry         -> recebe dados do ESP32
- GET  /api/stations/{id}/history
- GET  /api/ibge/history      -> histórico de enchentes por bairro
- GET  /api/external-sources  -> INMET/CEMADEN/Climagro/Windy/Ventusky (mockado)
- POST /api/leads             -> formulário de contato comercial
- GET  /api/analise-ia?prompt_usuario=... -> chama Gemini
- GET  /api/init-db
- GET  /api/mock/nowcasting

## O que ainda está mockado (IMPORTANTE)
- APIs Nacionais (INMET, CEMADEN, Climagro, Windy, Ventusky): MOCKED (retorna dados aleatórios).
  Para produção, integrar com as APIs reais: https://apitempo.inmet.gov.br, http://api.cemaden.gov.br.
- Histórico IBGE: MOCKED (dados simulados por bairro). Para produção, carregar malhas censitárias reais.
- Motor ensemble de IAs (GraphCast, AIFS, Pangu, FourCastNet, GenCast): MOCKED, usa consenso estatístico
  simulado. Para produção, integrar com ECMWF Open Data.
- Nowcasting: MOCKED (random). Substituir por Tomorrow.io ou INPE.

## Status
- Tudo rodando no preview: https://projeto-ao-vivo.preview.emergentagent.com
- Testado via screenshot (mapa + painel + 3 camadas) e curl (health, stations, ibge, external, telemetry POST, leads POST).
- Banco populado com 3 estações de teste (1 SAFE, 2 CRITICAL).

## Próximos passos sugeridos
P0: Deploy público final (clicar em "Deploy" no painel Emergent quando usuário quiser tornar definitivo).
P1: Substituir DATABASE_URL para Postgres (Neon/Supabase) quando usuário conseguir obter connection string.
P1: Integrar APIs reais (INMET, CEMADEN) substituindo mocks em /app/backend/engine/national_apis.py.
P2: Firmware ESP32: adicionar exemplo de código para envio HTTP POST /api/telemetry com REACT_APP_BACKEND_URL.
P2: Autenticação (RS 8.1 do SRS) - 2FA para disparar sirenes.
P3: Cell Broadcast real (botão "Acionar Sirenes" hoje só mostra alert).
P3: Tabela demografia_bairros com polígonos GeoJSON do IBGE (RF 2.1 PostGIS ST_Intersects).
