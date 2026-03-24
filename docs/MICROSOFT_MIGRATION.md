# Migration Plan: Google → Microsoft Infrastructure

> Written 2026-03-24. For reference when Steelwrist moves from Google Workspace to Microsoft 365.

---

## Overview

The app currently runs entirely on Google infrastructure:
- **Google Apps Script** hosts the backend and serves the frontend
- **Google Sheets** is the database
- **Google OAuth** (domain-restricted) handles auth

Moving to Microsoft means replacing all three layers. The React/Vite frontend itself requires almost no changes.

---

## Target Stack

| Layer | Current | Target |
|-------|---------|--------|
| Hosting | GAS HtmlService | Azure Static Web Apps |
| Backend | GAS TypeScript functions | Next.js API routes |
| Database | Google Sheets | Azure SQL (serverless) |
| Auth | Google OAuth (domain) | Microsoft Entra ID (tenant-restricted) |
| Deploy | `clasp push` | GitHub Actions CI/CD |
| Frontend API calls | `google.script.run` | `fetch('/api/...')` |

---

## What Changes, What Doesn't

### Stays the same
- All React components (`BrandGrid`, `ModelList`, `KitDetail`, `KitEditor`, etc.)
- All TypeScript types (`types.ts`)
- Business logic in GAS files — maps directly to Next.js API routes
- Bundled brand logos

### Small, isolated changes
- **`gasApi.ts`** — replace `google.script.run` wrapper with standard `fetch()` calls to REST endpoints
- **Auth check** — replace `Session.getActiveUser().getEmail()` with token from Entra ID

### Bigger lift
- **Database** — write a one-time export script to move Sheets data into SQL tables
- **Auth setup** — register app in Entra ID, configure tenant restriction

---

## Database: Recommended Option

**Azure SQL — serverless tier** (~$5/month at this scale).

Your data model is already relational. The 4 Sheets map directly to 4 SQL tables:

```sql
Brands    (id, name, logoFilename, active, createdAt)
Models    (id, brandId, brandName, name, tonnage, machineType, createdAt)
Kits      (id, modelIds, status, cableLength, ...)
KitRequests (id, brandName, modelName, requestedBy, note, status, createdAt, adminNote)
```

`modelIds` can stay as a JSON column (SQL Server supports `JSON_VALUE`) or be normalised into a join table.

### Why not SharePoint Lists?
SharePoint Lists are the "obvious" Microsoft equivalent of Sheets, but:
- Graph API for list data is verbose and slow to work with in code
- Querying/filtering is limited compared to SQL
- Gets messy as the schema grows

Use SharePoint Lists only if a non-developer needs to browse/edit the data directly in SharePoint.

### Other options considered

| Option | Verdict |
|--------|---------|
| SharePoint Lists | Workable, but clunky for code-first apps |
| Azure Cosmos DB | Overkill for this scale and data model |
| Microsoft Dataverse | Expensive licensing, complex setup |
| Supabase / Neon (Postgres) | Excellent DX, but not Microsoft-native |

---

## Auth: Microsoft Entra ID

Replace `Session.getActiveUser().getEmail()` with MSAL (Microsoft Authentication Library).

- Register the app in **Entra ID → App Registrations**
- Set **Supported account types** to: *Accounts in this organizational directory only* (tenant-restricted, equivalent to current domain restriction)
- Use the `@azure/msal-react` package in the frontend
- API routes validate the bearer token on each request

The admin role check (currently a lookup against the `Admins` sheet) stays the same logic — just reads from the `Admins` SQL table instead.

---

## Hosting: Azure Static Web Apps

Azure Static Web Apps (SWA) is the natural fit:
- Serves the React frontend (static build output)
- Hosts Next.js API routes as serverless functions (built-in support)
- Has **built-in Entra ID auth** with almost no config — add an `auth` block to `staticwebapp.config.json`
- Free tier is sufficient for internal tooling at this scale

---

## Migration Steps (when ready)

1. **Create Next.js project** — move React frontend into `app/` or `pages/`, add `app/api/` routes mirroring current GAS functions (`getBrands`, `saveKit`, etc.)
2. **Set up Azure SQL** — create database, run schema migration script
3. **Write data export script** — read from Sheets via Google Sheets API, insert into SQL (one-time run)
4. **Wire up Entra ID** — register app, add MSAL to frontend, add token validation middleware to API routes
5. **Replace `gasApi.ts`** — swap `google.script.run` calls for `fetch('/api/...')` calls
6. **Deploy to Azure Static Web Apps** — connect GitHub repo, configure CI/CD via GitHub Actions
7. **Smoke test** — verify auth, CRUD operations, kit lookup flow
8. **Cut over** — update the URL distributed to the sales team

---

## Estimated Effort

| Task | Effort |
|------|--------|
| Next.js project setup + port API routes | 1 day |
| Azure SQL schema + data migration script | 0.5 day |
| Entra ID auth setup | 0.5 day |
| Replace gasApi.ts + frontend wiring | 0.5 day |
| Deploy + smoke test | 0.5 day |
| **Total** | **~3 days** |

The codebase is well-structured for this migration. GAS-specific code is isolated and won't bleed into the component tree.

---

## Notes

- Do not redesign the data model during migration — keep schema identical to current Sheets columns to reduce risk
- The Admins table approach (email-based role check) works fine in SQL; no need to change the auth model
- If the Microsoft rollout is phased (some users on Google, some on Microsoft), the app can run in parallel on both until cutover
