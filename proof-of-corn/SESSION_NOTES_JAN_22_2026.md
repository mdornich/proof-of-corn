# Proof of Corn - Session Notes
## January 22, 2026 (Thursday, 3:00-4:00 PM PT)

---

## What We Shipped

### Website (proofofcorn.com)
- **5 pages**: Home, Story, Log, Process, Budget
- **Mobile responsive**: Tighter nav, stacking grids, smaller diagram text
- **Social sharing ready**: OG image (1200x630), Twitter card, corn emoji favicon
- **Verbatim transcript**: The 8:15 PM moment on the Embarcadero - exact words
- **Sol Tomato citation**: Footnote acknowledging the vibe coding movement

### Infrastructure
- Domain: proofofcorn.com ($12.99)
- GitHub: github.com/brightseth/proof-of-corn
- Weather API: OpenWeatherMap operational
- Email: seth@proofofcorn.com → Gmail forwarding
- Decision engine: farm_manager.py, daily_check.py
- Sensor firmware: ESP32 code ready

### Outreach
- 10 emails sent to Iowa ag ecosystem
- Email to Fred Wilson with project update
- Fred added as GitHub collaborator (fredwilsn)

### First AI Decision
**WAIT** - 78 days to planting window (April 11 - May 18)

---

## Fred's Response

Fred is blogging tomorrow to 40,000 readers. His ask: "What's the ask of my readers?"

**Seth's response** (shared with Fred):
> Real talk: we need help. Land lead in Iowa (5 acres, Polk County area). Custom operator who'll take a weird gig from an AI farm manager. Anyone who's done IoT sensors in agriculture. And vibe coders who want to ship something physical. GitHub's open, inbox is open (seth@proofofcorn.com).
>
> This is a template, not just a project. If AI can orchestrate corn, what else? Corn profits go to an Iowa food bank. What's YOUR impossible thing?

---

## Key Files

```
/proof-of-corn/
├── src/app/
│   ├── page.tsx              # Homepage
│   ├── story/page.tsx        # Origin story with verbatim transcript
│   ├── log/page.tsx          # Decision log (12 entries)
│   ├── process/page.tsx      # How it was built
│   ├── budget/page.tsx       # Cost tracking
│   ├── opengraph-image.tsx   # Social share image
│   ├── twitter-image.tsx     # Twitter card
│   ├── icon.tsx              # Favicon (corn emoji)
│   └── layout.tsx            # Meta tags, SEO
├── decision-engine/
│   ├── farm_manager.py       # Core decision framework
│   └── daily_check.py        # Automated monitoring
└── sensors/
    └── soil_sensor/src/main.cpp  # ESP32 firmware
```

---

## Pending / Next Steps

### Waiting On
- [ ] Responses from 10 outreach emails (1-3 business days)
- [ ] Fred's blog post (tomorrow)
- [ ] Fred's GitHub username confirmed (fredwilsn)

### Seth To Do
- [ ] Create Agromonitoring account (satellite imagery): https://home.agromonitoring.com/auth/sign-up
- [ ] Create ThingsBoard account (IoT dashboard): https://thingsboard.cloud/signup
- [ ] Set up Gmail "Send as" for seth@proofofcorn.com

### When Land is Secured
- [ ] Order IoT sensor kit (~$300)
- [ ] Configure satellite monitoring with field coordinates
- [ ] Finalize custom operator contract

---

## The Moment (8:15 PM, January 21, 2026)

Walking along the Embarcadero toward 1 Hotel San Francisco:

**SETH:** "I can do anything I want with software from my terminal."

**FRED:** "That's not fire. You can't like grow corn."

**SETH:** "I bet you I could... I will buy fucking land with an API via my terminal and I will hire some service to plant corn."

**FRED:** "You can hire Jeff to come and make dinner for you, but like you can't make dinner."

**SETH:** "No, but anything that could be done with technology, I can do now. Anything, which is insane."

---

## Budget

| Item | Cost | Status |
|------|------|--------|
| Domain | $12.99 | Paid |
| IoT Sensors | ~$300 | Planned |
| Soil Testing | ~$50 | Planned |
| Land Lease (5 acres) | ~$1,370 | Pending |
| Custom Operator | ~$800 | Pending |
| **Total Investment** | **~$2,533** | |
| **Expected Revenue** | **~$4,000** | (1000 bu × $4/bu) |

---

## Timeline

- **Jan 22**: Challenge accepted, site live
- **Jan-Feb**: Infrastructure, outreach, land search
- **Feb-Mar**: Land lease, operator contract
- **March**: Sensors deployed
- **Apr 11 - May 18**: Planting window
- **May-Sep**: Growing season (AI managing)
- **October**: Harvest

---

*78 days to planting. Clock's running.*
