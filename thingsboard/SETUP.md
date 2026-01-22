# ThingsBoard Setup Guide

## 1. Create Account

Go to: https://thingsboard.cloud/signup

Free tier includes:
- 30 devices
- 10M data points
- Real-time dashboards
- Rule engine

## 2. Create Device Profile

**Name**: Soil Sensor Node
**Type**: Default

**Telemetry keys**:
- `soil_moisture` (%)
- `soil_temp` (°F)
- `air_temp` (°F)
- `air_humidity` (%)
- `battery_voltage` (V)
- `rssi` (dBm)

## 3. Create Devices

Create one device per sensor node:

| Device Name | Location |
|-------------|----------|
| CORN-SENSOR-01 | Northwest corner |
| CORN-SENSOR-02 | Northeast corner |
| CORN-SENSOR-03 | Center (weather station) |

Copy the **Access Token** for each device → goes in ESP32 firmware.

## 4. Create Dashboard

### Widgets to add:

**Row 1 - Current Readings**
- Soil Moisture Gauge (0-100%)
- Soil Temperature Gauge (30-90°F)
- Air Temperature Display
- Humidity Display

**Row 2 - Time Series**
- Soil Moisture Chart (24hr)
- Temperature Chart (soil + air, 24hr)

**Row 3 - Alerts**
- Alarm widget for low moisture (<40%)
- Alarm widget for low soil temp (<50°F)

### Dashboard JSON

Import this after creating devices:

```json
{
  "title": "Proof of Corn - Field Monitor",
  "configuration": {
    "widgets": [
      {
        "type": "latest",
        "title": "Soil Moisture",
        "config": {
          "datasources": [{"type": "entity", "keys": ["soil_moisture"]}],
          "settings": {"minValue": 0, "maxValue": 100, "units": "%"}
        }
      },
      {
        "type": "latest",
        "title": "Soil Temperature",
        "config": {
          "datasources": [{"type": "entity", "keys": ["soil_temp"]}],
          "settings": {"minValue": 30, "maxValue": 90, "units": "°F"}
        }
      },
      {
        "type": "timeseries",
        "title": "Moisture History (24hr)",
        "config": {
          "datasources": [{"type": "entity", "keys": ["soil_moisture"]}],
          "settings": {"timewindow": {"realtime": {"timewindowMs": 86400000}}}
        }
      }
    ]
  }
}
```

## 5. Create Alarm Rules

### Low Moisture Alert

**Condition**: `soil_moisture < 40`
**Severity**: Warning
**Action**: Send email to seth@proofofcorn.com

### Planting Temperature Alert

**Condition**: `soil_temp >= 50` AND date between April 11 - May 18
**Severity**: Info
**Action**: Send email "Soil temperature reached planting threshold!"

### Critical Low Moisture

**Condition**: `soil_moisture < 25`
**Severity**: Critical
**Action**: Send email + webhook to Claude decision engine

## 6. API Access

For Claude's decision engine to query data:

**REST API Endpoint**:
```
GET https://thingsboard.cloud/api/plugins/telemetry/DEVICE_TYPE/DEVICE_ID/values/timeseries
```

**Headers**:
```
X-Authorization: Bearer {JWT_TOKEN}
```

Get JWT token:
```bash
curl -X POST https://thingsboard.cloud/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your@email.com","password":"yourpassword"}'
```

## 7. Mobile App

ThingsBoard has iOS/Android apps:
- Real-time dashboard viewing
- Push notifications for alarms
- Device management

Search "ThingsBoard" in app store.
