# Proof of Corn - Sensor Firmware

ESP32-based IoT sensors for real-time field monitoring.

## Hardware

### Soil Sensor Node
- ESP32 DevKit V1
- Capacitive soil moisture sensor (analog)
- DS18B20 waterproof temperature probe (soil)
- DHT22 temperature/humidity sensor (air)
- 6V solar panel + 18650 batteries

### Connections

```
ESP32 Pin    | Component
-------------|------------------
GPIO 34 (A)  | Soil moisture sensor
GPIO 4       | DS18B20 data (4.7k pullup to 3.3V)
GPIO 5       | DHT22 data
GPIO 35 (A)  | Battery voltage divider (optional)
3.3V         | Sensor power
GND          | Common ground
```

## Setup

### 1. Install PlatformIO

```bash
pip install platformio
```

### 2. Configure WiFi/ThingsBoard

Edit `src/main.cpp`:
```cpp
const char* WIFI_SSID = "your_wifi";
const char* WIFI_PASSWORD = "your_password";
const char* DEVICE_TOKEN = "your_thingsboard_token";
```

### 3. Build and Upload

```bash
cd sensors/soil_sensor
pio run -t upload
```

### 4. Monitor

```bash
pio device monitor
```

## ThingsBoard Setup

1. Create device in ThingsBoard Cloud
2. Copy access token
3. Paste into firmware config
4. Data will appear under device telemetry

## Data Format

Telemetry sent every 15 minutes:

```json
{
  "soil_moisture": 45.2,
  "soil_temp": 52.1,
  "air_temp": 48.5,
  "air_humidity": 65.3,
  "battery_voltage": 3.85,
  "rssi": -67
}
```

## Power Management

- Deep sleep between readings (15 min default)
- ~150μA sleep current
- ~80mA active current for ~10 seconds
- Solar panel keeps batteries charged

## Calibration

Soil moisture sensor calibration:
1. Note reading in dry air (~3500)
2. Note reading in water (~1500)
3. Adjust `SOIL_DRY` and `SOIL_WET` in code

## Field Deployment

1. Mount ESP32 in waterproof enclosure
2. Bury soil moisture sensor 4" deep
3. Bury DS18B20 probe 4" and 8" deep
4. Mount solar panel facing south
5. Position DHT22 in shaded, ventilated area
