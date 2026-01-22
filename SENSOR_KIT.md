# Proof of Corn - IoT Sensor Kit

**Purpose**: Real-time field monitoring for AI decision-making
**Budget**: $300-400
**Deployment**: March 2026

---

## Option A: DIY Kit (Recommended)

More educational, customizable, and fits the "vibe coding" ethos.

### Core Components

| Component | Qty | Purpose | Link | Est. Cost |
|-----------|-----|---------|------|-----------|
| ESP32 DevKit V1 | 2 | Microcontroller with WiFi | [Amazon](https://www.amazon.com/dp/B08D5ZD528) | $16 |
| Capacitive Soil Moisture Sensor v1.2 | 5 | Soil moisture (corrosion-resistant) | [Amazon](https://www.amazon.com/dp/B07SYBSHGX) | $12 |
| DS18B20 Waterproof Temp Probe | 4 | Soil temperature (buried) | [Amazon](https://www.amazon.com/dp/B00EU70ZL8) | $12 |
| DHT22 Temperature/Humidity | 2 | Air conditions | [Amazon](https://www.amazon.com/dp/B073F472JL) | $12 |
| BMP280 Pressure Sensor | 1 | Barometric pressure | [Amazon](https://www.amazon.com/dp/B07KYJNFMD) | $7 |

### Power System (Solar)

| Component | Qty | Purpose | Est. Cost |
|-----------|-----|---------|-----------|
| 6V 3.5W Solar Panel | 2 | Primary power | $20 |
| TP4056 Charge Controller | 2 | Battery management | $6 |
| 18650 Battery Holder (2-cell) | 2 | Battery storage | $8 |
| 18650 Batteries (3400mAh) | 4 | Power storage | $20 |

### Connectivity (Cellular - no WiFi in fields)

| Component | Qty | Purpose | Est. Cost |
|-----------|-----|---------|-----------|
| SIM7600A-H 4G LTE Module | 1 | Cellular data | $45 |
| OR: Blues Wireless Notecard | 1 | Easier cellular option | $49 |
| SIM Card (Hologram.io) | 1 | IoT data plan (~$0.40/MB) | $5/mo |

### Enclosures & Mounting

| Component | Qty | Purpose | Est. Cost |
|-----------|-----|---------|-----------|
| IP65 Waterproof Junction Box | 2 | Electronics housing | $20 |
| PVC Pipe (2" diameter) | 2 | Sensor mounting stakes | $10 |
| Cable Glands | 10 | Waterproof wire entry | $8 |
| Zip ties, wire, connectors | - | Assembly | $15 |

### DIY Kit Total: ~$265

---

## Option B: Pre-Built Agricultural Sensors

Less DIY, faster deployment, but higher cost.

### Ambient Weather WS-5000

- Complete weather station
- WiFi connected
- Solar powered
- ~$450
- [Link](https://ambientweather.com/ws-5000-smart-weather-station)

### Davis Instruments Vantage Vue

- Professional-grade weather
- Long range wireless
- ~$400
- [Link](https://www.davisinstruments.com/pages/vantage-vue)

### Teros 12 Soil Sensor (METER Group)

- Research-grade soil moisture
- ~$200 each
- Overkill for our needs

---

## Option C: Hybrid Approach (Recommended)

DIY soil sensors + affordable weather station

| Item | Cost |
|------|------|
| Ambient Weather WS-2000 | $170 |
| DIY soil sensor nodes (2) | $100 |
| Cellular modem | $50 |
| Mounting/misc | $30 |
| **Total** | **$350** |

---

## Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  Soil Sensors   │     │ Weather Station │
│  (ESP32 nodes)  │     │  (WS-2000)      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │ MQTT/HTTP             │ WiFi/API
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│           ThingsBoard Cloud             │
│  • Real-time dashboards                 │
│  • Alert rules                          │
│  • Data storage                         │
└────────────────────┬────────────────────┘
                     │
                     │ API
                     ▼
┌─────────────────────────────────────────┐
│        Claude Decision Engine           │
│  • Planting decisions                   │
│  • Irrigation alerts                    │
│  • Harvest timing                       │
└─────────────────────────────────────────┘
```

---

## Sensor Placement Plan (5-acre field)

```
    N
    ↑
┌───────────────────────────────────────┐
│                                       │
│   [S1]                      [S2]      │  S1, S2 = Soil sensor nodes
│    ●                         ●        │
│                                       │
│                                       │
│              [WX]                     │  WX = Weather station
│               ◆                       │       (center of field)
│                                       │
│                                       │
│   [S3]                      [S4]      │  S3, S4 = Additional soil nodes
│    ●                         ●        │           (if budget allows)
│                                       │
└───────────────────────────────────────┘
```

- **S1-S4**: Soil moisture + temperature at 4" and 8" depth
- **WX**: Air temp, humidity, rainfall, wind, pressure

---

## Shopping List (Quick Order)

### Amazon Cart (~$180 for basics)

1. ESP32 DevKit (2-pack): $16
2. Capacitive Soil Moisture (5-pack): $12
3. DS18B20 Waterproof (5-pack): $12
4. DHT22 (2-pack): $12
5. Solar panels 6V (2-pack): $18
6. 18650 batteries (4-pack): $20
7. TP4056 chargers (5-pack): $8
8. Waterproof boxes: $20
9. Jumper wires + breadboard: $12

### Separate Orders

- Blues Wireless Notecard Cellular: $49 (blues.io)
- Hologram SIM: $5 (hologram.io)
- Weather station (optional): $170 (ambientweather.com)

---

## Timeline

| Week | Action |
|------|--------|
| Feb 1 | Order components |
| Feb 15 | Assemble and test at home |
| Mar 1 | Deploy to field (after lease signed) |
| Mar 15 | Verify data flow to ThingsBoard |
| Apr 1 | Full system operational before planting |

---

## Code Repository

Sensor firmware will be added to:
`github.com/brightseth/proof-of-corn/sensors/`

Using Arduino framework with:
- PlatformIO for builds
- MQTT for ThingsBoard communication
- Deep sleep for power management
