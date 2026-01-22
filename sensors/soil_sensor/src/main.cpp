/**
 * Proof of Corn - Soil Sensor Node
 * ESP32 firmware for soil moisture and temperature monitoring
 *
 * Hardware:
 * - ESP32 DevKit V1
 * - Capacitive soil moisture sensor (GPIO 34)
 * - DS18B20 temperature probe (GPIO 4)
 * - DHT22 air temp/humidity (GPIO 5)
 *
 * Communication:
 * - MQTT to ThingsBoard Cloud
 * - Deep sleep between readings for power saving
 *
 * Author: Claude Code (Opus 4.5) + Seth Goldstein
 * Project: proofofcorn.com
 */

#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ===== CONFIGURATION =====
// WiFi credentials (will use cellular in field, WiFi for testing)
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// ThingsBoard configuration
const char* THINGSBOARD_SERVER = "thingsboard.cloud";
const int THINGSBOARD_PORT = 1883;
const char* DEVICE_TOKEN = "YOUR_DEVICE_TOKEN";  // From ThingsBoard device

// Sensor pins
#define SOIL_MOISTURE_PIN 34    // Analog input
#define DS18B20_PIN 4           // OneWire for soil temp
#define DHT_PIN 5               // DHT22 data pin
#define DHT_TYPE DHT22

// Calibration values for soil moisture sensor
// Dry soil (in air) ~3500, Wet soil (in water) ~1500
#define SOIL_DRY 3500
#define SOIL_WET 1500

// Deep sleep duration (15 minutes = 900 seconds)
#define SLEEP_DURATION_SEC 900

// ===== GLOBAL OBJECTS =====
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
OneWire oneWire(DS18B20_PIN);
DallasTemperature soilTempSensor(&oneWire);
DHT dht(DHT_PIN, DHT_TYPE);

// ===== SENSOR READING FUNCTIONS =====

float readSoilMoisture() {
    // Read analog value and convert to percentage
    int rawValue = analogRead(SOIL_MOISTURE_PIN);

    // Constrain to calibration range
    rawValue = constrain(rawValue, SOIL_WET, SOIL_DRY);

    // Map to 0-100% (inverted because lower value = wetter)
    float moisture = map(rawValue, SOIL_DRY, SOIL_WET, 0, 100);

    Serial.printf("Soil moisture: %.1f%% (raw: %d)\n", moisture, rawValue);
    return moisture;
}

float readSoilTemperature() {
    soilTempSensor.requestTemperatures();
    float tempC = soilTempSensor.getTempCByIndex(0);
    float tempF = tempC * 9.0 / 5.0 + 32.0;

    if (tempC == DEVICE_DISCONNECTED_C) {
        Serial.println("Soil temp sensor disconnected!");
        return -999;
    }

    Serial.printf("Soil temperature: %.1f°F (%.1f°C)\n", tempF, tempC);
    return tempF;
}

float readAirTemperature() {
    float tempF = dht.readTemperature(true);  // true = Fahrenheit

    if (isnan(tempF)) {
        Serial.println("Failed to read air temperature!");
        return -999;
    }

    Serial.printf("Air temperature: %.1f°F\n", tempF);
    return tempF;
}

float readAirHumidity() {
    float humidity = dht.readHumidity();

    if (isnan(humidity)) {
        Serial.println("Failed to read humidity!");
        return -999;
    }

    Serial.printf("Air humidity: %.1f%%\n", humidity);
    return humidity;
}

// ===== CONNECTIVITY =====

void connectWiFi() {
    Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\nConnected! IP: %s\n", WiFi.localIP().toString().c_str());
    } else {
        Serial.println("\nFailed to connect to WiFi!");
    }
}

void connectMQTT() {
    mqtt.setServer(THINGSBOARD_SERVER, THINGSBOARD_PORT);

    Serial.print("Connecting to ThingsBoard...");

    int attempts = 0;
    while (!mqtt.connected() && attempts < 5) {
        if (mqtt.connect("ESP32_SoilSensor", DEVICE_TOKEN, NULL)) {
            Serial.println("connected!");
        } else {
            Serial.printf("failed (rc=%d), retrying...\n", mqtt.state());
            delay(2000);
            attempts++;
        }
    }
}

// ===== DATA TRANSMISSION =====

void sendTelemetry(float soilMoisture, float soilTemp, float airTemp, float airHumidity) {
    if (!mqtt.connected()) {
        Serial.println("MQTT not connected, skipping send");
        return;
    }

    // Build JSON payload
    StaticJsonDocument<256> doc;
    doc["soil_moisture"] = soilMoisture;
    doc["soil_temp"] = soilTemp;
    doc["air_temp"] = airTemp;
    doc["air_humidity"] = airHumidity;
    doc["battery_voltage"] = analogRead(35) * 3.3 / 4095 * 2;  // If using voltage divider
    doc["rssi"] = WiFi.RSSI();

    char payload[256];
    serializeJson(doc, payload);

    Serial.printf("Sending telemetry: %s\n", payload);

    if (mqtt.publish("v1/devices/me/telemetry", payload)) {
        Serial.println("Telemetry sent successfully!");
    } else {
        Serial.println("Failed to send telemetry!");
    }
}

// ===== DEEP SLEEP =====

void enterDeepSleep() {
    Serial.printf("Entering deep sleep for %d seconds...\n", SLEEP_DURATION_SEC);

    // Configure wake-up source
    esp_sleep_enable_timer_wakeup(SLEEP_DURATION_SEC * 1000000ULL);

    // Disconnect WiFi to save power
    WiFi.disconnect(true);
    WiFi.mode(WIFI_OFF);

    Serial.println("Good night!");
    Serial.flush();

    esp_deep_sleep_start();
}

// ===== MAIN PROGRAM =====

void setup() {
    Serial.begin(115200);
    delay(100);

    Serial.println("\n========================================");
    Serial.println("  PROOF OF CORN - Soil Sensor Node");
    Serial.println("  proofofcorn.com");
    Serial.println("========================================\n");

    // Initialize sensors
    pinMode(SOIL_MOISTURE_PIN, INPUT);
    soilTempSensor.begin();
    dht.begin();

    // Let sensors stabilize
    delay(2000);

    // Read all sensors
    float soilMoisture = readSoilMoisture();
    float soilTemp = readSoilTemperature();
    float airTemp = readAirTemperature();
    float airHumidity = readAirHumidity();

    // Connect and send data
    connectWiFi();

    if (WiFi.status() == WL_CONNECTED) {
        connectMQTT();
        sendTelemetry(soilMoisture, soilTemp, airTemp, airHumidity);

        // Give time for MQTT to complete
        mqtt.loop();
        delay(1000);
        mqtt.disconnect();
    }

    // Go to sleep
    enterDeepSleep();
}

void loop() {
    // Never reached due to deep sleep
}
