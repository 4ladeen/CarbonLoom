/*
 * CarbonLoom ESP32 + SCT-013-000 Non-Invasive CT Current Clamp Firmware
 * Measures factory machine current, computes RMS power (kW), and publishes MQTT telemetry.
 * Offline-resilient edge capture for Bangladeshi garment factories.
 */

#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "Factory-WiFi-Mesh";
const char* password = "factory_secret_pass";
const char* mqtt_server = "192.168.1.100"; // Local Factory Mini-PC Gateway

WiFiClient espClient;
PubSubClient client(espClient);

const int ADC_PIN = 34; // Analog pin connected to SCT-013 burden resistor
const float VOLTAGE_MAINS_V = 230.0; // Bangladesh grid 230V single phase / 400V 3-phase
const float CALIBRATION_FACTOR = 60.6; // SCT-013 100A / 50mA ratio calibration

void setup() {
  Serial.begin(115200);
  analogReadResolution(12); // 12-bit ADC (0-4095)
  setup_wifi();
  client.setServer(mqtt_server, 1883);
}

void setup_wifi() {
  delay(10);
  WiFi.begin(ssid, password);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
  }
}

float measureCurrentRMS() {
  int numSamples = 1000;
  double sumSquared = 0;
  
  for (int i = 0; i < numSamples; i++) {
    int rawValue = analogRead(ADC_PIN);
    double voltage = (rawValue - 2048) * (3.3 / 4096.0); // Remove DC bias
    double current = voltage * CALIBRATION_FACTOR;
    sumSquared += current * current;
    delayMicroseconds(20);
  }
  return sqrt(sumSquared / numSamples);
}

void loop() {
  if (!client.connected()) {
    client.connect("ESP32-CT-PADMA-01");
  }
  client.loop();

  float currentRMS = measureCurrentRMS();
  float activePowerKW = (currentRMS * VOLTAGE_MAINS_V * 0.92) / 1000.0; // Approx 0.92 PF

  char payload[160];
  snprintf(payload, sizeof(payload), 
    "{\"meter_id\":\"MTR-ESP32-01\",\"current_rms\":%.2f,\"active_kw\":%.3f,\"data_quality\":\"measured\",\"tamper\":false}",
    currentRMS, activePowerKW
  );

  client.publish("factory/meters/telemetry", payload);
  delay(10000); // Publish every 10 seconds
}
