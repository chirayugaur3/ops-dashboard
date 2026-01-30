# 📊 Operations Attendance Dashboard# 📊 Operational Attendance & Field Activity Dashboard# Operational Attendance & Field Activity Dashboard



A real-time dashboard for tracking employee attendance, work hours, and field activity.



![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)> **Production-ready internal operations dashboard** for monitoring employee attendance, verifying location compliance, and managing exceptions in real-time.A fast, authoritative, and reliable dashboard for logistics/operations teams — designed to surface who's on-field now, verify location compliance, and list actionable exceptions.



---



## ✨ Features![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)## 🎯 Purpose



- **🔐 Secure Login** - Single-owner authentication![React](https://img.shields.io/badge/React-19.2-blue?logo=react)

- **📈 Live Metrics** - Active employees, total hours, compliance rate

- **📊 Activity Chart** - Hourly punch-in/out visualization  ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)Give operations and HR immediate situational awareness and fast resolution workflows.

- **👥 Employee Workload** - Top performers by work hours

- **🗺️ Location Map** - Real-time employee positions![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css)

- **⚠️ Exceptions** - Missed punches, location breaches with actions

![License](https://img.shields.io/badge/License-MIT-green)### Business Goals

---

- Reduce time-to-resolve attendance exceptions to < 15 minutes

## 🚀 Quick Start

---- Achieve 99% data-to-UI consistency for displayed KPIs

### 1. Install Dependencies

```bash- Initial MVP supports up to 2,000 daily punches without UI lag

npm install

```## 🎯 TL;DR



### 2. Configure Environment## 🚀 Quick Start

Create `.env.local` file:

```bash**Enhanced dashboard** with:

# Google Sheet URL (published as CSV)

NEXT_PUBLIC_GOOGLE_SHEET_URL=your-google-sheet-csv-url- 🔐 **Role-based authentication** (NextAuth 5.x + JWT)### Prerequisites



# Auth Secret (any random string 32+ chars)- 🧪 **Comprehensive testing** (Jest + RTL, 80%+ coverage on core logic)- Node.js 18+

AUTH_SECRET=your-super-secret-key-min-32-characters

- 📊 **Error monitoring** (Sentry integration)- npm or yarn

# App URL

NEXTAUTH_URL=http://localhost:3000- ✨ **Magnetic UI/UX** (Framer Motion animations, dark mode, F-pattern layout)

```

- 🗄️ **Smart state management** (React Query for server, Zustand for UI)### Installation

### 3. Run Development Server

```bash- 🚀 **CI/CD pipeline** (GitHub Actions + Vercel deployment)

npm run dev

``````bash



### 4. Open Dashboard**Data flows from Google Sheets** → Business logic in backend → Beautiful, responsive frontend that ops managers can scan in 5-30 seconds.# Install dependencies

Visit: **http://localhost:3000**

npm install

---

---

## 🔑 Login Credentials

# Start development server

| Field | Value |

|-------|-------|## 🏗️ Architecturenpm run dev

| Email | `yadavanillogisnow@gmail.com` |

| Password | `anilyadav123` |```



---```



## 📁 Project Structure┌─────────────────────────────────────────────────────────────────────────┐Open [http://localhost:3000](http://localhost:3000) in your browser.



```│                              FRONTEND                                    │

src/

├── app/                    # Pages├──────────────┬──────────────┬───────────────┬──────────────────────────┤## 📁 Project Structure

│   ├── page.tsx           # Entry point (redirects)

│   ├── login/             # Login page│  Components  │    Hooks     │    Stores     │        Services          │

│   ├── dashboard/         # Main dashboard

│   └── api/               # Backend APIs│  (UI only)   │ (React Query)│  (Zustand)    │      (API calls)         │```

│

├── components/            # UI Components│              │              │  Theme, Modal │                          │src/

│   ├── KPICard.tsx       # Metric cards

│   ├── ActivityChart.tsx # Hourly chart│  - KPICard   │  - useKPIs   │  Filters, UI  │  - fetchKPIs()           │├── app/                    # Next.js App Router

│   ├── WorkloadBarList.tsx

│   ├── ExceptionsTable.tsx│  - MapView   │  - useAuth   │               │  - fetchExceptions()     ││   ├── api/                # API routes (mock backend)

│   └── MapView.tsx

││  - Charts    │              │               │                          ││   │   ├── kpis/

├── lib/                   # Core Logic

│   ├── auth.ts           # Authentication├──────────────┴──────────────┴───────────────┴──────────────────────────┤│   │   ├── activity/

│   └── googleSheets.ts   # Data fetching

││                         Next.js API Routes                              ││   │   ├── employees/

├── hooks/                 # React Hooks

├── services/              # API services│                    (Protected by NextAuth middleware)                   ││   │   ├── locations/

└── types/                 # TypeScript types

```├─────────────────────────────────────────────────────────────────────────┤│   │   ├── exceptions/



> 📖 See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed explanation│                    Business Logic (googleSheets.ts)                     ││   │   └── employee/



---│              Punch Pairing (FIFO) • Exception Classification            ││   ├── dashboard/          # Main dashboard page



## 🔄 User Flow│              Compliance Calculation • KPI Aggregation                   ││   ├── layout.tsx          # Root layout



```├─────────────────────────────────────────────────────────────────────────┤│   └── page.tsx            # Root redirect

┌─────────┐     ┌───────────┐     ┌───────────┐

│  Visit  │ ──→ │   Login   │ ──→ │ Dashboard ││                      Google Sheets (CSV Data Source)                    │├── components/             # Presentation components

│    /    │     │   Page    │     │   Page    │

└─────────┘     └───────────┘     └───────────┘│                    (Anyone can edit, no database needed)                ││   ├── KPICard.tsx

                                        │

                                        ↓└─────────────────────────────────────────────────────────────────────────┘│   ├── ActivityChart.tsx

                                  ┌───────────┐

                                  │  Sign Out │```│   ├── WorkloadBarList.tsx

                                  │     ↓     │

                                  │  Login    ││   ├── ExceptionsTable.tsx

                                  └───────────┘

```---│   ├── FiltersPanel.tsx



---│   ├── MapView.tsx



## 📊 Data Source## 🚀 Quick Start│   ├── ShiftDetailModal.tsx



Data is fetched from a **Google Sheet** published as CSV.│   └── ResolveDialog.tsx



### Required Sheet Columns:### Prerequisites├── hooks/                  # React Query hooks

- Employee ID

- Employee Name  - Node.js 20+│   └── useQueries.ts

- Punch Type (IN/OUT)

- Timestamp- npm or yarn├── services/               # API service functions

- Latitude/Longitude

- Location Name- Google Sheet with attendance data (see [Data Setup](#data-setup))│   └── api.ts



---├── lib/                    # Utilities & tokens



## 🛠️ Tech Stack### Installation│   ├── tokens.ts           # Design tokens



| Technology | Purpose |│   ├── utils.ts            # Helper functions

|------------|---------|

| Next.js 16 | Framework |```bash│   └── mockData.ts         # Mock data generators

| TypeScript | Type Safety |

| Tailwind CSS | Styling |# Clone the repository├── providers/              # Context providers

| NextAuth.js | Authentication |

| React Query | Data Fetching |git clone https://github.com/yourusername/ops-dashboard.git│   └── QueryProvider.tsx

| Recharts | Charts |

| Leaflet | Maps |cd ops-dashboard└── types/                  # TypeScript types



---    └── index.ts



## 🚢 Deployment (Vercel)# Install dependencies```



1. Push to GitHubnpm install

2. Import to Vercel

3. Add Environment Variables:## 🎨 UX Model

   - `NEXT_PUBLIC_GOOGLE_SHEET_URL`

   - `AUTH_SECRET`# Copy environment variables

   - `NEXTAUTH_URL` (your Vercel URL)

4. Deploycp .env.example .env.localThe dashboard follows a strict information hierarchy:



---



## 📝 Change Credentials# Start development server```



Edit `src/lib/auth.ts`:npm run devOverview → Patterns → Exceptions → Details on demand

```typescript

const OWNER_EMAIL = 'new-email@example.com';``````

const OWNER_PASSWORD = 'new-password';

```



---Open [http://localhost:3000](http://localhost:3000) and login with demo credentials:1. **Overview**: Dominant live metric + 2-3 supporting KPIs



## 📄 License2. **Patterns**: Charts (muted), employee workload bar (sorted)



Private - All rights reserved.| Email | Password | Role |3. **Exceptions**: Actionable table with View/Resolve actions


|-------|----------|------|4. **Details**: Raw paired shifts/logs only when requested

| `admin@company.com` | `admin123` | Admin (full access) |

| `hr@company.com` | `hr123` | HR Admin (view + resolve) |## 🛠 Tech Stack

| `ops@company.com` | `ops123` | Ops Manager (view only) |

| `supervisor@company.com` | `super123` | Supervisor (limited) |- **Framework**: Next.js 14 (App Router)

- **Language**: TypeScript

---- **Styling**: Tailwind CSS

- **Data Fetching**: React Query (TanStack Query)

## 📁 Project Structure- **Charts**: Recharts

- **Maps**: Leaflet + React-Leaflet

```- **Icons**: Lucide React

src/

├── app/                    # Next.js App Router## 📋 API Endpoints

│   ├── api/               # API routes (protected)

│   │   ├── auth/         # NextAuth handlers| Endpoint | Method | Description |

│   │   ├── kpis/         # KPI endpoint|----------|--------|-------------|

│   │   ├── exceptions/   # Exceptions CRUD| `/api/kpis` | GET | KPI metrics |

│   │   └── ...| `/api/activity/hourly` | GET | Hourly punch activity |

│   ├── dashboard/        # Main dashboard page| `/api/employees/top-workload` | GET | Top employees by hours |

│   └── login/            # Authentication page| `/api/locations` | GET | Location list |

├── components/            # React components (presentation only)| `/api/locations/latest` | GET | Latest employee locations |

│   ├── KPICard.tsx       # Hero metric cards| `/api/exceptions` | GET | Exceptions with pagination |

│   ├── MapView.tsx       # Leaflet map with clustering| `/api/exceptions/[id]/resolve` | POST | Resolve an exception |

│   ├── ExceptionsTable.tsx| `/api/employee/[id]/shifts` | GET | Employee shift history |

│   ├── AnimatedLayout.tsx # Framer Motion wrappers

│   └── ...All responses include `serverTimestamp` for staleness detection.

├── hooks/                 # Custom React hooks

│   ├── useQueries.ts     # React Query hooks## 📖 Documentation

│   └── useAuth.ts        # Auth state and permissions

├── stores/               # Zustand stores- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) - Full project specification

│   └── uiStore.ts        # Theme, modals, filters- [BUSINESS_RULES.md](BUSINESS_RULES.md) - Business logic rules

├── lib/                  # Utilities and business logic- [.github/copilot-instructions.md](.github/copilot-instructions.md) - AI coding guidelines

│   ├── googleSheets.ts   # CSV parsing, pairing algorithm

│   ├── auth.ts           # NextAuth configuration## 🧪 Development

│   ├── logger.ts         # Sentry-integrated logging

│   └── utils.ts          # Helper functions### Available Scripts

├── services/             # API service functions

│   └── api.ts```bash

└── types/                # TypeScript definitionsnpm run dev      # Start development server

    ├── index.ts          # Data contractsnpm run build    # Build for production

    └── auth.ts           # Auth typesnpm run start    # Start production server

```npm run lint     # Run ESLint

```

---

### Design Tokens

## 🔐 Authentication & Authorization

Colors, typography, and spacing are defined in `src/lib/tokens.ts`. Only three status colors are used:

### Role-Based Access Control (RBAC)

- 🟢 **Green** (#22C55E) - Compliant

| Role | View Dashboard | Resolve Exceptions | Export Reports | Manage Users |- 🟡 **Amber** (#F59E0B) - Warning

|------|---------------|-------------------|----------------|--------------|- 🔴 **Red** (#EF4444) - Breach

| Admin | ✅ | ✅ | ✅ | ✅ |

| HR Admin | ✅ | ✅ | ✅ | ❌ |### Component Guidelines

| Ops Manager | ✅ | ❌ | ✅ | ❌ |

| Supervisor | ✅ (own site) | ✅ (own site) | ❌ | ❌ |Components follow a strict contract-based design:



### Protected Routes```tsx

- All `/dashboard/*` routes require authentication// PURPOSE: [what this component does]

- All `/api/*` routes (except `/api/auth`) are protected by middleware// INPUT: [props with types]

- Resolve buttons conditionally rendered based on role// BEHAVIOR: [interactions and state]

// UX: [visual/accessibility requirements]

---// DO NOT: [anti-patterns to avoid]

```

## 📊 Business Logic

## ♿ Accessibility

### Punch Pairing Algorithm (FIFO)

```- All interactive elements are keyboard accessible

1. Sort all punches by timestamp (ascending)- Status colors always paired with text badges

2. For each Punch In:- Contrast ratio >= 4.5:1 for body text

   - Find the next Punch Out (within 24h)- Visible focus styles

   - If found → Create paired shift- Semantic HTML and ARIA labels

   - If not found → Flag as OpenSession exception

3. Punch Out without preceding In → PunchOutWithoutIn exception## 📝 License

```

MIT

### Compliance Classification
| Distance | Status | UI Color |
|----------|--------|----------|
| ≤ 50m | Compliant | 🟢 Green |
| 51-100m | Warning | 🟡 Amber |
| > 100m | Breach | 🔴 Red |
| Missing | Unknown | ⚪ Gray |

### Exception Severity
| Exception | Condition | Severity |
|-----------|-----------|----------|
| OpenSession | < 12 hours | `warning` |
| OpenSession | ≥ 12 hours | `critical` |
| LocationBreach | 100-200m | `warning` |
| LocationBreach | > 200m | `critical` |

---

## 🎨 UI/UX Design Principles

### Heuristic-Driven Design (Nielsen's 10)
1. **Visibility of Status** - Loading states, real-time updates, toast notifications
2. **Match Real World** - Familiar terminology (punch in/out, compliance)
3. **User Control** - Clear filters, undo actions, easy navigation
4. **Consistency** - Uniform animations, color coding, button styles
5. **Error Prevention** - Confirmation dialogs, input validation

### Visual Hierarchy (F-Pattern Layout)
```
┌─────────────────────────────────────────────────────┐
│ [Logo]     [Search]                    [Theme] [User]│  ← Header (sticky)
├─────────────────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                     │
│ │ KPI │ │ KPI │ │ KPI │ │ KPI │  ← Hero metrics     │  ← Overview
│ └─────┘ └─────┘ └─────┘ └─────┘                     │
├─────────────────────────────────────────────────────┤
│ ┌───────────────┐ ┌───────────────┐                 │
│ │  Activity     │ │     Map       │  ← Patterns     │  ← Patterns
│ │  Chart        │ │               │                 │
│ └───────────────┘ └───────────────┘                 │
├─────────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────────┐   │
│ │          Exceptions Table                      │   │  ← Exceptions
│ │  [View] [Resolve]                              │   │
│ └───────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Micro-Interactions
- **Hover effects**: Scale 1.02, shadow enhancement
- **Transitions**: 300ms ease-out for modals, cards
- **Loading states**: Skeleton shimmer animations
- **Notifications**: Slide-in toast messages

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

### Test Coverage Goals
- **Core business logic** (`googleSheets.ts`): 80%+
- **Components**: Render and interaction tests
- **API routes**: Integration tests with mocked data

### Test Files
```
src/
├── lib/__tests__/
│   └── googleSheets.test.ts    # Unit tests for business logic
├── components/__tests__/
│   └── KPICard.test.tsx        # Component tests
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   - `NEXT_PUBLIC_GOOGLE_SHEET_URL`
   - `AUTH_SECRET` (generate with `openssl rand -base64 32`)
   - `NEXT_PUBLIC_SENTRY_DSN` (optional)

3. **Deploy**
   ```bash
   vercel --prod
   ```

### GitHub Actions CI/CD
The repository includes a complete CI/CD pipeline (`.github/workflows/ci.yml`):
- ✅ Lint and type check on every push
- ✅ Run tests with coverage
- ✅ Build verification
- ✅ Auto-deploy to Vercel on main branch
- ✅ Preview deployments for PRs

---

## 📈 Monitoring

### Sentry Integration
- **Frontend errors**: Automatic capture with stack traces
- **API errors**: Logged with request context
- **Performance**: Transaction tracing (20% sample rate in production)

### Logging
```typescript
import { apiLogger } from '@/lib/logger';

apiLogger.info('KPIs calculated', { activeEmployees: 42 });
apiLogger.error('CSV parse failed', error, { url: sheetUrl });
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GOOGLE_SHEET_URL` | Yes | Published Google Sheet CSV URL |
| `AUTH_SECRET` | Yes | NextAuth encryption secret |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking DSN |
| `GOOGLE_CLIENT_ID` | No | For Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | For Google OAuth |

### Data Setup

1. Create a Google Sheet with columns:
   - `Name`, `Employee ID`, `Punch Type`, `Location`, `Timestamp`, `Manual Location`, `Distance(m)`

2. Publish to web:
   - File → Share → Publish to web
   - Select "Comma-separated values (.csv)"
   - Copy the URL

3. Set `NEXT_PUBLIC_GOOGLE_SHEET_URL` in `.env.local`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Run tests: `npm test`
4. Commit changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **UX Inspiration**: Nielsen Norman Group heuristics, Gestalt principles
- **Architecture**: Inspired by enterprise-grade dashboards and modern React patterns
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/chirayugaur">Chirayu Gaur</a>
</p>
