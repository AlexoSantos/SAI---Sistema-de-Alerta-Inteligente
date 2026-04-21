#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Configurações de Rede (Ajustar antes de gravar)
const char* ssid = "NOME_DA_SUA_REDE";
const char* password = "SENHA_DA_SUA_REDE";

// Endpoint do Servidor (IP local do seu PC para testes, ou IP da nuvem na V2)
const char* serverName = "http://192.168.0.100:8000/api/telemetry";

// Pinos do Sensor Ultrassônico à prova d'água JSN-SR04T
const int trigPin = 5;
const int echoPin = 18;

// Altura total da ponte até o fundo do rio (em cm)
// Ex: Se o sensor está a 500cm do fundo do rio, e mede 100cm de distância até a água, o nível do rio é 400cm.
const float ALTURA_PONTE_CM = 500.0;

// Configuração de Deep Sleep (Desperta a cada 5 minutos)
#define uS_TO_S_FACTOR 1000000ULL
#define TIME_TO_SLEEP  300

void setup() {
  Serial.begin(115200);
  
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Conectar ao Wi-Fi
  WiFi.begin(ssid, password);
  Serial.println("Conectando ao WiFi...");
  
  int retries = 0;
  while(WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }
  
  if(WiFi.status() == WL_CONNECTED) {
    Serial.println("\nConectado à rede WiFi.");
    
    // Ler os sensores
    float distancia_agua_cm = lerUltrassom();
    float nivel_rio_cm = ALTURA_PONTE_CM - distancia_agua_cm;
    
    // Evitar leituras negativas se o rio secar totalmente
    if(nivel_rio_cm < 0) nivel_rio_cm = 0;
    
    Serial.print("Distância lida: "); Serial.println(distancia_agua_cm);
    Serial.print("Nível do Rio calculado: "); Serial.println(nivel_rio_cm);
    
    // Enviar dados para a API Python
    enviarDados(nivel_rio_cm);
  } else {
    Serial.println("Falha na conexão WiFi. Dormindo.");
  }

  // Entrar em Deep Sleep para economizar bateria solar
  Serial.println("Entrando em Deep Sleep por 5 minutos...");
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  esp_deep_sleep_start();
}

void loop() {
  // Não é utilizado com Deep Sleep
}

float lerUltrassom() {
  // Limpa o pino trig
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  
  // Envia um pulso de 10 microssegundos
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Lê o tempo de retorno no pino echo
  long duracao = pulseIn(echoPin, HIGH);
  
  // Calcula a distância (Velocidade do som: 343m/s ou 0.0343 cm/µs)
  float distanciaCm = duracao * 0.034 / 2;
  
  return distanciaCm;
}

void enviarDados(float nivelRio) {
  if(WiFi.status()== WL_CONNECTED){
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");

    // Construir o JSON de telemetria usando a biblioteca ArduinoJson
    StaticJsonDocument<200> doc;
    doc["station_id"] = "ST-001";
    doc["temperature"] = 28.5; // (Placeholder: Conectar sensor BME280 depois)
    doc["humidity"] = 60.0;
    doc["pressure"] = 1013.25;
    doc["rain_volume_mm"] = 0.0;
    doc["wind_speed_kmh"] = 12.0;
    doc["river_level_cm"] = nivelRio;

    String jsonPayload;
    serializeJson(doc, jsonPayload);
    
    Serial.print("Enviando POST: ");
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    
    if(httpResponseCode > 0) {
      Serial.print("Resposta do Servidor: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Erro no envio HTTP: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
}
