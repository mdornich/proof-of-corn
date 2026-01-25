# UX Consolidation Plan

## Current State (11 pages - TOO MANY)

1. **/ (Home)** - Hero, thesis, architecture
2. **/story** - Full narrative
3. **/fred** - Live Fred visualization
4. **/log** - Decision log (live)
5. **/community** - HN, learnings, feedback
6. **/dashboard** - Weather, emails, tasks, HN
7. **/transparency** - Human intervention log, FAQ, constitution
8. **/budget** - Cost breakdown
9. **/stats** - HN + traffic stats
10. **/process** - How this was built
11. **/vision** - 3D farm visualizations

## Redundancy Issues

**Data pages (consolidate into 1):**
- /dashboard - weather, emails, tasks
- /stats - HN stats, traffic
- /budget - expenses
- /vision - 3D regions

**Narrative pages (consolidate into 1):**
- /story - project narrative
- /process - how it was built
- /transparency - FAQ, constitution

**Decision tracking (keep separate):**
- /log - pure decision stream (keep)
- /transparency - human interventions (merge into About)

## Proposed New Structure (5 core pages)

### 1. **/ (Home)** - Landing
- Hero + thesis
- Autonomy milestone banner
- Clear CTAs to Fred, Dashboard, Community

### 2. **/about** - All narrative content
MERGE: /story + /process + /transparency
- **Story tab**: Project origin, Fred Wilson challenge
- **How It Works tab**: Architecture, human-AI collaboration
- **Transparency tab**: FAQ, constitution, human intervention log, roadmap
- Single cohesive narrative

### 3. **/fred** - Live Agent (unchanged)
- Real-time Fred visualization
- Activity feed
- Weather monitoring

### 4. **/dashboard** - ALL DATA
MERGE: /dashboard + /stats + /budget + /vision + new commodities/partnerships
- **Overview tab**: Key metrics, budget status
- **Weather tab**: Multi-region monitoring
- **Partnerships tab**: Active leads evaluation
- **Commodities tab**: ROI comparison
- **Regions tab**: 3D visualizations (from /vision)
- **Stats tab**: HN, traffic analytics
- Single source of truth for all data

### 5. **/log** - Decision Stream (unchanged)
- Pure chronological log
- Live from Fred's API
- Full transparency

### 6. **/community** - Engagement (enhanced)
- **HN Discussion tab**: Current
- **Feedback tab**: Current
- **Learnings tab**: Current
- Maybe add: Partnerships, Commodities (or keep in dashboard)

## New Navigation

```
Home | About | Fred | Dashboard | Log | Community
```

Clean, minimal, obvious purpose for each page.

## Migration Plan

1. Create /about - consolidate story + process + transparency
2. Enhance /dashboard - add budget, stats, commodities, partnerships, regions tabs
3. Delete: /story, /process, /transparency, /budget, /stats, /vision
4. Update all navigation references
5. Add redirects for old URLs

## Benefits

- **Clarity**: Each page has single clear purpose
- **Discoverability**: All data in one place (/dashboard)
- **Simplicity**: 6 pages instead of 11
- **Mobile-friendly**: Fewer nav items
- **Maintainability**: Less redundancy

## Implementation

Can be done in 2 phases:
1. Phase 1: Create /about, enhance /dashboard
2. Phase 2: Remove old pages, update nav
