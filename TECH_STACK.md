# Technology Stack Recommendation
## Quantum Connect Kit Configurator

**Date:** 2026-03-24

---

## Recommendation Summary

Two viable options are described. **Option A is recommended** because it lives entirely inside the Google ecosystem (zero external hosting), uses Google Sheets as the editable database (immediately familiar to your team), and is fully buildable with Claude Code CLI using the `clasp` toolchain.

---

## Option A — Google Apps Script + React (Recommended)

### Architecture Overview

```
┌─────────────────────────────────────────┐
│           Google Drive Domain           │
│                                         │
│  ┌──────────────┐   ┌───────────────┐   │
│  │  Sales App   │   │   Admin App   │   │
│  │  (GAS Web    │   │  (GAS Web     │   │
│  │   App)       │   │   App /       │   │
│  │              │   │   Sheets UI)  │   │
│  └──────┬───────┘   └──────┬────────┘   │
│         │                  │            │
│         └────────┬─────────┘            │
│                  │                      │
│         ┌────────▼────────┐             │
│         │  Google Sheets  │             │
│         │  (Kit Database) │             │
│         └─────────────────┘             │
└─────────────────────────────────────────┘
```

### Components

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (bundled with Vite, served via GAS HtmlService) | Sales UI and Admin UI |
| **Backend** | Google Apps Script (TypeScript via clasp) | Data access layer, auth, API |
| **Database** | Google Sheets | Kit records, brands, models, requests |
| **Auth** | Google OAuth (built into GAS — zero config) | All users authenticated via Google |
| **Storage** | Google Drive | Brand logos (images in a Drive folder) |
| **Dev toolchain** | clasp + Node.js + Vite | Local development with Claude Code CLI |

### How Auth Works

Google Apps Script Web Apps run under the deploying user's account or ask the accessing user to authorize with their Google account. Because the app lives in your Google Drive, access is restricted to your Google Workspace domain with a single setting — no OAuth app registration needed.

### Database: Google Sheets Structure

One spreadsheet acts as the database with separate tabs (sheets):

| Sheet Tab | Contents |
|---|---|
| `Brands` | id, name, logo_drive_id, active |
| `Models` | id, brand_id, name, tonnage, machine_type |
| `Kits` | id, model_id, status, cable_length, left_joysticks, right_joysticks, flags, steering_kits, config_part_no, prerequisites, limitations, updated_at |
| `KitRequests` | id, brand, model, email, note, status, created_at, admin_note |
| `Users` | email, role (sales/admin) |

Administrators can edit the Sheets directly for bulk updates, or use the Admin UI for a guided form experience.

### Why Google Sheets as the Database

- Zero server/database cost and zero ops burden
- Admins can do bulk edits (copy/paste rows, sort, filter) in native Sheets — no special training
- Version history built in (Google Sheets revision history)
- Import from your existing Google Sheet of brands/models is a direct copy-paste

### Dev Workflow with Claude Code CLI

```bash
# Install clasp globally
npm install -g @google/clasp

# Login to Google
clasp login

# Clone or create the Apps Script project locally
clasp clone <scriptId>

# Develop locally (TypeScript, React components)
# Use Vite to bundle React → inline HTML for GAS HtmlService

# Push changes to Google
clasp push

# Deploy as web app
clasp deploy
```

Claude Code CLI can edit TypeScript source files, run Vite builds, and push via clasp — the full loop works locally.

### Limitations of Option A

- Apps Script has execution time limits (6 min per call; not a concern here)
- UI hosted via `HtmlService` requires bundling React into a single HTML file — adds a small build step
- No SSR; purely client-side React app

---

## Option B — Next.js + Google Sheets API + Google OAuth (this is not what we are implementing)

### Architecture Overview

```
┌──────────────────────┐      ┌─────────────────────────┐
│   Next.js App        │      │   Google APIs           │
│   (Vercel or Cloud   │◄────►│   - Sheets API (DB)     │
│   Run)               │      │   - Drive API (logos)   │
│                      │      │   - OAuth 2.0 (auth)    │
└──────────────────────┘      └─────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Auth** | NextAuth.js with Google provider |
| **Database** | Google Sheets (via `googleapis` npm package) |
| **Hosting** | Vercel (free tier) or Google Cloud Run |
| **Dev toolchain** | Node.js, npm — standard Claude Code CLI workflow |

### Why Option B May Be Preferred

- More modern developer experience (React Server Components, Tailwind)
- Easier to add features later (email, notifications, third-party APIs)
- Standard npm ecosystem — every library available
- Claude Code CLI works natively (no build pipeline quirks)

### Why Option B Is Not Recommended Here

- Requires external hosting (Vercel or Cloud Run account + billing)
- Requires registering a Google OAuth app in Google Cloud Console
- More infrastructure to maintain
- Does not live "inside Google Drive" as naturally as Option A

---

## Shared Decisions (Both Options)

| Decision | Choice | Rationale |
|---|---|---|
| UI framework | React | Component reuse between sales and admin views |
| Styling | Tailwind CSS | Rapid UI development, consistent design tokens |
| Brand logo storage | Google Drive folder (shared) | Already in Drive, Drive API for serving images |
| Kit data storage | Google Sheets | Admin-friendly, importable from existing sheet |
| Language | TypeScript | Type safety for data model, better tooling |

---

## Recommended File / Folder Structure (Option A)

```
KitStructure/
├── src/
│   ├── gas/                  # Apps Script backend (TypeScript)
│   │   ├── Code.ts           # Entry point, doGet(), API functions
│   │   ├── SheetsDB.ts       # Sheets read/write helpers
│   │   └── Auth.ts           # Role checks
│   ├── client/               # React frontend
│   │   ├── sales/            # Sales-facing UI
│   │   │   ├── BrandGrid.tsx
│   │   │   ├── ModelList.tsx
│   │   │   └── KitDetail.tsx
│   │   └── admin/            # Admin UI
│   │       ├── KitList.tsx
│   │       ├── KitEditor.tsx
│   │       └── RequestList.tsx
│   └── shared/               # Shared types and constants
│       ├── types.ts
│       └── joysticks.ts      # Static joystick catalogue
├── dist/                     # Vite build output (committed for clasp push)
├── appsscript.json
├── vite.config.ts
├── package.json
└── tsconfig.json
```
