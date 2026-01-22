# Next Steps - Grow Corn Challenge

## Immediate Actions (This Week)

### 1. Create Platform Accounts
- [ ] **ThingsBoard Cloud** - https://thingsboard.cloud/signup
  - Free tier: 30 devices, 10M data points
  - No credit card required

- [ ] **Leaf Agriculture** - https://withleaf.io/
  - Request API access for satellite imagery + farm data
  - Mention: small pilot project, 5 acres, corn

- [ ] **OpenWeatherMap API** - https://openweathermap.org/api
  - Free tier: 1,000 calls/day
  - Get API key for weather forecasts

### 2. Find Custom Operators (Iowa/Midwest)

**Search these directories this week**:

1. **Wisconsin Custom Operators Directory**
   https://wiscustomoperators.org/directory/

2. **MIFarmLink (Michigan)**
   https://mifarmlink.org/find-a-farmer

3. **Iowa State Extension contacts**
   https://www.extension.iastate.edu/agdm/crops/html/a3-15.html

**Questions to ask operators**:
- Do you work with remote/absentee landowners?
- Can you provide regular reports/photos during growing season?
- What's your rate for full-service corn (plant to harvest)?
- Can we install IoT sensors on the plot?
- Have you worked with tech-enabled farming before?

### 3. Research Land Options

**Platforms to check**:
- https://www.landwatch.com/ (land listings)
- https://www.landandfarm.com/ (farm land)
- Local Iowa county extension offices

**What we need**:
- 5-10 acres (small enough to be affordable)
- Access for sensor installation
- Custom farming allowed
- Short-term lease OK (single season)

### 4. Order Sensor Kit

**Basic IoT Kit for Field Corn** (~$300-500):

| Component | Qty | Purpose | Est. Cost |
|-----------|-----|---------|-----------|
| ESP32 DevKit | 2 | Microcontroller/WiFi | $20 |
| Soil moisture sensor (capacitive) | 5 | Moisture monitoring | $25 |
| DHT22 | 2 | Temp/humidity | $15 |
| Solar panel + battery | 2 | Power in field | $60 |
| Waterproof enclosure | 2 | Protection | $40 |
| Cellular modem (LTE) | 1 | Remote connectivity | $50+ |
| Misc (wires, mounts, etc.) | - | Assembly | $50 |

**Alternative**: Use a pre-built agricultural sensor system
- https://www.seabornecontrols.com/ (ag sensors)
- https://www.vinduino.com/ (soil moisture)
- https://www.arable.com/ (all-in-one, pricier)

---

## Decision Point: Two Viable Paths

### Path A: Full Custom Farm (Recommended for Fred demo)
- Lease actual land in Iowa
- Install our own sensors
- Hire custom operator
- **Pro**: Maximum authenticity, we "own" the corn
- **Con**: More setup, higher cost (~$3K)

### Path B: Vertical Farm Subscription
- Use Willo or similar service ($149/month)
- They grow greens in our "plot"
- Real-time dashboard access
- **Pro**: Fast, guaranteed success, hands-off
- **Con**: Not field corn, less impressive for "grow corn" claim

**My recommendation**: Path A. Fred will be more impressed by actual field corn in Iowa than lettuce in San Jose. The whole point is demonstrating that AI can orchestrate traditional agriculture.

---

## Week 2-3: Contract Phase

Once we have:
- Custom operator identified
- Land option selected
- Sensor kit ordered

Then we need to:
1. Draft simple contract with operator (or use their standard)
2. Execute land lease
3. Open bank account or use existing for farm expenses
4. Document everything in `/Projects/grow-corn-challenge/`

---

## Budget Authorization Needed

To proceed, I need your go-ahead on approximate spend:

| Phase | Cost | When |
|-------|------|------|
| Sensors/equipment | $300-500 | February |
| Land lease deposit | $500-1000 | February-March |
| Custom operator deposit | ~$200-300 | March |
| Seeds + inputs | $200-300 | April |
| **Total before harvest** | **~$1,500-2,000** | |

Harvest revenue (est.): 5 acres × 200 bu × $4/bu = $4,000
**Net**: Could actually profit if yields are good!

---

## Questions for You, Seth

1. **Budget**: Are you OK spending ~$2-3K on this? (We might break even or profit)

2. **Location preference**: Iowa (classic corn country) or closer to you?

3. **Timeline flexibility**: The planting window is April 15-May 18. Are you committed to hitting the 2026 season? (If not, we'd plant in 2027)

4. **How hands-on**: Do you want to visit the farm once or twice, or fully remote?

5. **Fred timeline**: When do you want to show him? Fall 2026 would be ideal (harvest complete, corn in hand)

---

## Files in This Project

```
/Projects/grow-corn-challenge/
├── CASE_STUDY.md          # Full case study for Fred
├── NEXT_STEPS.md          # This file - action items
├── contracts/             # (to be created) Lease and operator agreements
├── sensor-data/           # (to be created) IoT data exports
├── decisions/             # (to be created) Claude decision logs
└── photos/                # (to be created) Progress documentation
```
