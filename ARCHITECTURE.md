# 📁 Project Architecture Guide

## Quick Overview

This is an **Operations Attendance Dashboard** - a web app that shows employee attendance data, work hours, locations, and exceptions (issues that need attention).

```
┌─────────────────────────────────────────────────────────────┐
│                         USER FLOW                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User visits site → Login Page → Dashboard → Sign Out      │
│                                                             │
│   Data comes from: Google Sheets (your friend's sheet)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Folder Structure Explained

```
dasboard/
│
├── 📄 .env.local              # SECRET SETTINGS (passwords, API keys)
├── 📄 package.json            # Project dependencies list
├── 📄 middleware.ts           # Route protection (checks login)
│
├── 📁 src/                    # ALL SOURCE CODE LIVES HERE
│   │
│   ├── 📁 app/                # PAGES (what user sees)
│   │   ├── page.tsx           # Home "/" - redirects based on login
│   │   ├── layout.tsx         # Common wrapper for all pages
│   │   ├── globals.css        # Global styles
│   │   │
│   │   ├── 📁 login/          # LOGIN PAGE
│   │   │   └── page.tsx       # Email + Password form
│   │   │
│   │   ├── 📁 dashboard/      # DASHBOARD PAGE
│   │   │   └── page.tsx       # Main dashboard with all widgets
│   │   │
│   │   └── 📁 api/            # BACKEND API ROUTES
│   │       ├── 📁 auth/       # Authentication endpoints
│   │       ├── 📁 kpis/       # Key metrics (active employees, hours)
│   │       ├── 📁 activity/   # Hourly punch activity data
│   │       ├── 📁 employees/  # Employee workload data
│   │       ├── 📁 exceptions/ # Issues needing attention
│   │       └── 📁 locations/  # Employee location data
│   │
│   ├── 📁 components/         # REUSABLE UI PIECES
│   │   ├── KPICard.tsx        # Metric cards (Active Employees, etc.)
│   │   ├── ActivityChart.tsx  # Hourly activity bar chart
│   │   ├── WorkloadBarList.tsx# Top employees by hours
│   │   ├── ExceptionsTable.tsx# Issues table with actions
│   │   ├── MapView.tsx        # Employee locations on map
│   │   └── ...                # Other UI components
│   │
│   ├── 📁 lib/                # CORE UTILITIES
│   │   ├── auth.ts            # LOGIN LOGIC (email/password check)
│   │   ├── googleSheets.ts    # FETCHES DATA from Google Sheet
│   │   └── utils.ts           # Helper functions
│   │
│   ├── 📁 hooks/              # DATA FETCHING HOOKS
│   │   └── useQueries.ts      # React Query hooks for API calls
│   │
│   ├── 📁 services/           # API CALL FUNCTIONS
│   │   └── api.ts             # Functions to call backend APIs
│   │
│   └── 📁 types/              # TYPE DEFINITIONS
│       └── index.ts           # Data shape definitions
│
└── 📁 public/                 # STATIC FILES (images, icons)
```

---

## 🔐 Authentication Flow

### How Login Works

```
┌──────────────────────────────────────────────────────────────┐
│                     LOGIN PROCESS                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. User enters email + password                             │
│                        ↓                                     │
│  2. Frontend sends to /api/auth/callback/credentials         │
│                        ↓                                     │
│  3. auth.ts checks:                                          │
│     - Is email = yadavanillogisnow@gmail.com ?               │
│     - Is password = anilyadav123 ?                           │
│                        ↓                                     │
│  4. If YES → Create session token → Redirect to dashboard    │
│     If NO  → Show "Invalid email or password"                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Key File: `src/lib/auth.ts`

```typescript
// This is where login credentials are defined
const OWNER_EMAIL = 'yadavanillogisnow@gmail.com';
const OWNER_PASSWORD = 'anilyadav123';
```

### Session Management

- Uses **JWT tokens** (stored in browser cookies)
- Session lasts **8 hours**
- Protected by `middleware.ts` - blocks access to `/dashboard` if not logged in

---

## 📊 Data Flow

### Where Does Data Come From?

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Google Sheet (CSV) ──→ googleSheets.ts ──→ API Routes     │
│                                                ↓            │
│                                          Dashboard Page     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key File: `src/lib/googleSheets.ts`

This file:
1. Fetches CSV data from the Google Sheet URL
2. Parses each row into structured data
3. Groups data by employee
4. Calculates work hours, exceptions, etc.

### API Endpoints

| Endpoint | What It Returns |
|----------|----------------|
| `/api/kpis` | Active employees count, total hours, compliance % |
| `/api/activity/hourly` | Punch counts for each hour (for bar chart) |
| `/api/employees/top-workload` | Top 10 employees by work hours |
| `/api/exceptions` | List of issues (missed punch, location breach) |
| `/api/locations/latest` | Latest location of each employee |

---

## 🎨 Dashboard Components

### What Each Component Shows

| Component | Purpose | Data Source |
|-----------|---------|-------------|
| `KPICard` | Big numbers at top (Active: 45, Hours: 320) | `/api/kpis` |
| `ActivityChart` | Bar chart of hourly punch activity | `/api/activity/hourly` |
| `WorkloadBarList` | Top employees ranked by hours | `/api/employees/top-workload` |
| `ExceptionsTable` | Table of issues with View/Resolve buttons | `/api/exceptions` |
| `MapView` | Map showing employee locations | `/api/locations/latest` |

### Component Location

All components are in `src/components/` and exported from `src/components/index.ts`

---

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `.env.local` | Secret settings (Google Sheet URL, Auth Secret) |
| `package.json` | Project dependencies and scripts |
| `next.config.ts` | Next.js configuration |
| `tsconfig.json` | TypeScript settings |
| `middleware.ts` | Route protection logic |

### Environment Variables (`.env.local`)

```bash
# Google Sheet with attendance data
NEXT_PUBLIC_GOOGLE_SHEET_URL=https://docs.google.com/spreadsheets/d/...

# Authentication secret (for JWT tokens)
AUTH_SECRET=your-secret-key

# App URL
NEXTAUTH_URL=http://localhost:3000
```

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## 📝 Common Questions

### Q: How do I change the login credentials?
**A:** Edit `src/lib/auth.ts` - change `OWNER_EMAIL` and `OWNER_PASSWORD`

### Q: How do I connect a different Google Sheet?
**A:** Change `NEXT_PUBLIC_GOOGLE_SHEET_URL` in `.env.local`

### Q: Why is the dashboard not showing data?
**A:** Check if the Google Sheet URL is accessible (must be published to web as CSV)

### Q: How do I add a new user?
**A:** Currently single-user only. To add more users, modify the `authorize` function in `auth.ts`

### Q: How do I deploy to Vercel?
**A:** 
1. Push code to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## 🏗️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 16** | React framework with API routes |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Styling |
| **NextAuth.js** | Authentication |
| **React Query** | Data fetching & caching |
| **Recharts** | Charts |
| **Leaflet** | Maps |
| **Framer Motion** | Animations |
