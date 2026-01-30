# Operational Attendance & Field Activity Dashboard - Copilot Instructions

## Project Purpose
Build an Operational Attendance & Field Activity Dashboard for logistics/operations teams: fast, authoritative, reliable — designed to surface who's on-field now, verify location compliance, and list actionable exceptions.

## Architecture Rules

### UX Model (ALWAYS FOLLOW)
```
Overview → Patterns → Exceptions → Details on demand
```
- **Overview**: 1 dominant live metric + 2–3 supporting metrics (top of screen)
- **Patterns**: charts (muted), employee workload bar (sorted)
- **Exceptions**: actionable table with explicit actions (View / Resolve / Export)
- **Details**: raw paired shifts/logs only when requested

### Component Responsibilities
- **UI Components**: Presentation-only, accept data via props, emit callbacks for actions
- **Hooks**: Handle data fetching with React Query, manage loading/error states
- **Services**: API calls with typed responses following data contracts
- **Backend**: ALL business logic (pairing, exception classification, aggregates)

### Visual Constraints
- **Colors**: Neutral palette + only 3 status colors (Green=compliant, Amber=warning, Red=breach)
- **Typography**: Large numeric (40-48px), headings (18-22px), body (13-15px)
- **Spacing**: Generous whitespace around KPIs, 12-column responsive grid

### Data Contracts
All API responses must include `serverTimestamp` for staleness detection.
See `PROJECT_CONTEXT.md` for full API specifications.

### NEVER DO
- Compute business logic (pairing, exceptions) in frontend
- Show all raw locations on map by default
- Rely on client timezones
- Use color as the only status indicator
- Accept inconsistent naming across modules

## File Comment Templates

### Component Files
```tsx
// PURPOSE: [what this component does]
// INPUT: [props with types]
// BEHAVIOR: [interactions and state]
// UX: [visual/accessibility requirements]
// DO NOT: [anti-patterns to avoid]
```

### Hook Files
```tsx
// PURPOSE: [what this hook manages]
// RETURNS: { data, isLoading, isError, ... }
// CACHING: [cache key and invalidation strategy]
```

### Service Files
```tsx
// PURPOSE: [what API this calls]
// CONTRACT: [endpoint and response shape]
// ERROR HANDLING: [how errors are surfaced]
```
