# Proof of Corn - Infrastructure Setup

**Last Updated**: January 22, 2026
**Status**: In Progress

---

## 1. APIs & Platforms

### OpenWeatherMap (Weather Data)
- **Status**: Ready to configure
- **URL**: https://openweathermap.org/api
- **Free Tier**: 1,000,000 calls/month, 60 calls/minute
- **Available Data**:
  - Current weather
  - 5-day forecast (3-hour intervals)
  - Air quality
  - Geocoding
- **Cost**: Free
- **Next Step**: Create account, get API key, test Iowa weather endpoint

### ThingsBoard (IoT Platform)
- **Status**: Ready to configure
- **URL**: https://thingsboard.cloud
- **Free Tier**: 30 devices, 10M data points
- **Features**:
  - MQTT, CoAP, HTTP protocols
  - Real-time dashboards
  - Rule engine for alerts
  - Mobile app access
- **Cost**: Free
- **Next Step**: Create account, set up "Proof of Corn" device profile

### Leaf Agriculture (Farm Data API)
- **Status**: Email sent, awaiting response
- **URL**: https://withleaf.io
- **Features**:
  - Satellite imagery (NDVI)
  - Unified farm data format
  - Field boundary management
  - Weather integration
- **Pricing**: Per-use for small projects, contact for quote
- **Next Step**: Await response

### Satellite Imagery Options

**Option 1: OpenWeather Agro API** (FREE with existing account)
- URL: https://agromonitoring.com/
- Landsat 8 + Sentinel 2 based
- NDVI, EVI indices
- True/False color imagery
- Included in free OpenWeather tier

**Option 2: Sentinel Hub** (Free tier available)
- URL: https://www.sentinel-hub.com/
- Copernicus Sentinel-2 data
- 10-20m resolution
- 5-day revisit
- NDVI calculations via API
- Trial available

**Option 3: Planet Labs** (30-day free trial)
- URL: https://www.planet.com/sign-up/agriculture/
- 3.7m resolution daily imagery
- Best-in-class for agriculture
- 30,000 processing units free trial
- Contact sales for small area pricing

---

## 2. Custom Farming Rates (Iowa 2025)

Source: [Iowa State Extension Farm Custom Rate Survey](https://www.extension.iastate.edu/agdm/crops/html/a3-10.html)

### Full-Service Corn Production
| Service | Average Rate | Median Rate |
|---------|-------------|-------------|
| Complete corn production | $167.75/acre | $150.00/acre |
| Complete soybean production | $154.50/acre | $140.00/acre |

### For Our 5-Acre Plot
| Item | Calculation | Cost |
|------|-------------|------|
| Full-service corn | 5 acres × $150-168/acre | $750 - $840 |
| Land lease (est.) | 5 acres × $274/acre | $1,370 |
| **Subtotal** | | **$2,120 - $2,210** |

### What's Included in Full-Service
- Tillage
- Planting
- Weed control (basic)
- Harvesting
- Delivery to specified location

---

## 3. Iowa Extension Contacts

### Polk County Extension (Des Moines Area)
- **Address**: 1625 Adventureland Drive, Suite A, Altoona, IA 50009
- **Phone**: 515-957-5760
- **Email**: polkextoffice@iastate.edu
- **Hours**: Mon-Thu 8am-5pm, Fri 8am-2pm
- **Purpose**: Ask for referrals to custom operators, small plot lease options

### Iowa Custom Rate Survey Contact
- **Name**: Ann Johanns
- **Organization**: Iowa State University Extension
- **Address**: Borlaug Learning Center, 3327 290th St., Nashua, IA 50658
- **Phone**: 515-337-2766
- **Email**: aholste@iastate.edu
- **Purpose**: Get list of survey participants who are custom operators

### Iowa Corn Growers Association
- **URL**: https://www.iowacorn.org
- **Purpose**: Industry connections, potential partnerships

---

## 4. Land Options

### Target Criteria
- **Size**: 5-10 acres (enough to demonstrate, not overwhelming)
- **Location**: Central Iowa (Des Moines area for easier logistics)
- **Lease Type**: Short-term (single season) or flexible
- **Requirements**:
  - Allows custom farming
  - Access for sensor installation
  - Willing to work with remote/tech-enabled landowner

### Resources to Search
1. **LandSearch**: https://www.landsearch.com/leases/iowa
2. **Midwest Land Management**: https://www.midwestlandmanagement.com/farm-real-estate/land-for-rent/
3. **Iowa Land Co**: https://iowalandco.com/farm-sales/farms-for-rent/
4. **Iowa DNR Beginning Farmer Program**: Small plots on wildlife areas

### Estimated Land Costs (2025 Iowa Average)
- Cropland: $274/acre
- 5 acres: ~$1,370/year
- Could negotiate lower for small, single-season lease

---

## 5. IoT Sensor Kit

### Components Needed
| Component | Qty | Purpose | Est. Cost |
|-----------|-----|---------|-----------|
| ESP32 DevKit | 2 | Microcontroller/WiFi | $20 |
| Capacitive soil moisture sensor | 5 | Moisture monitoring | $25 |
| DHT22 temperature/humidity | 2 | Air conditions | $15 |
| DS18B20 waterproof temp probe | 3 | Soil temperature | $15 |
| Solar panel (6V 3.5W) | 2 | Power | $30 |
| 18650 battery + holder | 4 | Battery backup | $25 |
| LTE modem (SIM7600) | 1 | Cellular connectivity | $50 |
| Waterproof enclosure | 2 | Field protection | $40 |
| Mounting stakes/hardware | - | Installation | $30 |
| **Total Estimate** | | | **$250-350** |

### Pre-Built Alternative
- **Arable Mark 2**: ~$2,000 (all-in-one field sensor)
- **Davis Instruments**: ~$400-800 (weather station)
- **Verdict**: DIY kit is more educational and fits budget

### Connectivity Strategy
- LTE modem for cellular data (no WiFi in fields)
- MQTT protocol to ThingsBoard
- Data sent every 15 minutes (configurable)
- Solar + battery for continuous operation

---

## 6. Timeline & Next Actions

### Week 1 (Jan 22-28, 2026)
- [ ] Create OpenWeatherMap account and test API
- [ ] Create ThingsBoard Cloud account
- [ ] Email Leaf Agriculture for API access
- [ ] Call Polk County Extension for operator referrals
- [ ] Research land options on LandSearch

### Week 2 (Jan 29 - Feb 4)
- [ ] Order IoT sensor components
- [ ] Follow up on custom operator leads
- [ ] Draft custom farming agreement template
- [ ] Begin land lease negotiations

### Week 3-4 (Feb 5-18)
- [ ] Finalize land lease
- [ ] Sign custom operator contract
- [ ] Assemble and test sensor kit
- [ ] Configure ThingsBoard dashboards

### March 2026
- [ ] Install sensors on leased land
- [ ] Verify data flow to ThingsBoard
- [ ] Integrate weather API with decision engine
- [ ] Conduct pre-planting soil test

### April 2026
- [ ] Monitor soil temperature daily
- [ ] Claude makes planting decision when conditions met
- [ ] Coordinate with custom operator for planting
- [ ] Document first major AI decision

---

## 7. Email Templates

### To Polk County Extension
```
Subject: Looking for Custom Farming Operators for Small Plot - Proof of Corn Project

Hello,

I'm looking for recommendations for custom farming operators in the Des Moines
area who might be interested in working on a unique project.

I'm planning to lease a small plot (5-10 acres) to grow field corn this season,
with the twist that all management decisions will be made by an AI system (Claude).
The AI will aggregate sensor data and weather forecasts to coordinate timing of
operations with the custom operator.

I'm looking for operators who:
- Are comfortable working with a remote/tech-enabled landowner
- Can provide regular updates and photos
- Would be open to having IoT sensors installed on the field

Could you recommend any custom operators in your area who might be interested?

Thank you,
Seth Goldstein
```

### To Custom Operator (Template)
```
Subject: Custom Farming Inquiry - 5 Acres Corn, Tech-Enabled Project

Hello,

I'm seeking a custom operator for an interesting project this growing season.

The project: I'm growing 5 acres of corn where all management decisions
(planting timing, irrigation calls, harvest timing) will be made by an AI
system based on real-time sensor data. You'd handle all physical operations.

What I need:
- Full-service corn production (tillage through harvest)
- Flexible communication (email/text updates work great)
- Openness to having IoT sensors (soil moisture, temp) installed
- Photos/updates during the season for documentation

This is a documented case study, and I'm happy to credit your operation
in the project materials. I'm offering standard custom rates per the
Iowa Custom Rate Survey.

Would you be interested in discussing?

Best,
Seth Goldstein
```

### To Leaf Agriculture
```
Subject: API Access Request - Proof of Corn Research Project

Hello Leaf team,

I'm working on a research project called "Proof of Corn" that demonstrates
AI-orchestrated farming. The project uses Claude Code (Anthropic's AI) to
make all farm management decisions for a 5-acre corn plot in Iowa.

I'm interested in accessing Leaf's API for:
- Satellite imagery (NDVI) to monitor crop health
- Integration with our ThingsBoard IoT setup
- Historical field data if available

This is a small-scale pilot (single season, one 5-acre field) with public
documentation. Happy to provide case study materials and attribution.

Could you advise on API access for a project of this scope?

Thank you,
Seth Goldstein
proofofcorn.com
```

---

## 8. Budget Summary

| Category | Estimated Cost |
|----------|---------------|
| Domain (proofofcorn.com) | $12.99 |
| IoT sensors/equipment | $250-350 |
| Land lease (5 acres) | $1,000-1,500 |
| Custom operator (full service) | $750-850 |
| Seed corn | $75-100 |
| Contingency | $300 |
| **Total** | **$2,400 - $3,100** |

### Potential Revenue
- Expected yield: 5 acres × 200 bu/acre = 1,000 bushels
- Corn price (2026 est.): ~$4.00/bushel
- Gross revenue: ~$4,000

**Net Position**: Could break even or profit ~$1,000-1,500

---

*This document is updated as infrastructure is configured and contracts are signed.*
