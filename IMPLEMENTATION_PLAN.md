# Implementation Plan
## Quantum Connect Kit Configurator

**Date:** 2026-03-24
**Assumes:** Option A tech stack (Google Apps Script + React + Google Sheets)
**Prerequisite:** All questions in OPEN_QUESTIONS.md answered before Phase 1 begins.

---

## Phase Overview

```
Phase 0 — Setup & Data Foundation       (prep)
Phase 1 — Sales UI: Browse & View       (core feature)
Phase 2 — Admin UI: Kit Management      (core feature)
Phase 3 — Kit Request Feature           (secondary feature)
Phase 4 — Polish & Hardening            (quality)
Phase 5 — Deployment & Handover         (go-live)
```

Each phase produces working, testable software before the next begins.

---

## Phase 0 — Setup & Data Foundation

**Goal:** Establish the project skeleton, toolchain, and seed data so all subsequent phases can build on a real data layer.

### Tasks

- [ ] Initialize Git repo and folder structure (as per TECH_STACK.md)
- [ ] Install and configure `clasp`, link to Google Workspace account
- [ ] Create the Apps Script project (or scaffold a new one)
- [ ] Set up Vite for bundling React → single HTML for GAS HtmlService
- [ ] Set up TypeScript + ESLint + Prettier
- [ ] Create the Google Sheets database workbook with all required tabs:
  - `Brands`, `Models`, `Kits`, `KitRequests`, `Users`
  - Define column headers matching the data model in FSD.md
- [ ] Import existing brand and model data from your current Google Sheet
- [ ] Upload brand logos to a designated Google Drive folder
- [ ] Populate 2–3 complete kit records as seed data for development
- [ ] Write `SheetsDB.ts` helper functions: `getBrands()`, `getModels()`, `getKit()`, `getKits()`
- [ ] Confirm role-gating: restrict admin sheet access by Google Workspace group/email

**Deliverable:** Local dev environment runs; Sheets database populated; data-access layer tested against real seed data.

---

## Phase 1 — Sales UI: Browse & View

**Goal:** Sales users can log in with their Google account, browse brands, select a model, and view a complete kit specification.

### Tasks

- [ ] Implement `doGet()` in `Code.ts` — serves the React app HTML
- [ ] Implement auth check: verify user is in the `Users` sheet with `sales` or `admin` role
- [ ] Build `BrandGrid` component
  - Responsive logo grid (CSS Grid)
  - Fetch brands from `getBrands()` via `google.script.run`
  - Filter to only brands with Available/Coming Soon kits
  - Search/filter input above grid
- [ ] Build `ModelList` component
  - List models for selected brand with tonnage and status badge
  - Back navigation to brand grid
- [ ] Build `KitDetail` component
  - Header: brand logo, model name, tonnage, status badge
  - Static base kit summary card
  - Dynamic section: cable length, joystick options (left + right), flags
  - Steering kit section (conditional on machine type)
  - Configuration file part number
  - Prerequisites & limitations notice block
- [ ] Implement client-side routing (React Router or simple state machine — no URL routing needed for GAS)
- [ ] Apply Tailwind CSS styling — clean, professional look
- [ ] Responsive layout tested on desktop and tablet

**Deliverable:** Sales user can go from brand grid → model list → kit detail. All real data shown. No edit capability.

---

## Phase 2 — Admin UI: Kit Management

**Goal:** Administrators can log in to a separate admin panel, manage all kit records, and manage brands/models.

### Tasks

- [ ] Create separate GAS web app deployment for admin (restricted to admin role)
- [ ] Build `KitList` component
  - Sortable/filterable table: brand, model, tonnage, status, cable length, config P/N, updated
  - Per-row Edit and Delete (soft) actions
  - "+ New Kit" button
- [ ] Build `KitEditor` component (used for both create and edit)
  - All fields as described in FSD.md section 4.3
  - Brand dropdown (populated from Brands sheet)
  - Model text + tonnage
  - Machine type selector (CEX / MEX / WEX)
  - Status radio
  - Cable length radio
  - Left joystick multi-select (checkboxes with part number + description)
  - Right joystick multi-select
  - Flags: feeder valves, extra QIO
  - Steering kit options (shown/hidden based on machine type)
  - Config file part number input
  - Prerequisites + limitations text areas
  - Save / Cancel buttons
- [ ] Wire editor to `SheetsDB.ts` write helpers: `upsertKit()`, `deleteKit()`
- [ ] Build `BrandManager` component — add/edit/remove brands, upload logos
- [ ] Build `ModelManager` component — add/edit/remove models per brand
- [ ] Input validation: required fields, part number format
- [ ] Show last-updated timestamp and updated-by email on each kit record

**Deliverable:** Admins can create, edit, delete kit records. Brand and model lists are maintainable without touching the spreadsheet directly.

---

## Phase 3 — Kit Request Feature

**Goal:** Sales users can submit a request for a kit that does not yet exist. Admins can track and manage these requests.

### Tasks

- [ ] Add "Request this kit" button to Kit Detail screen (visible when status is Coming Soon or kit absent)
- [ ] Build `KitRequestModal` component
  - Pre-filled: brand name, model name
  - Optional note field (customer name, urgency)
  - Submit button → calls `submitKitRequest()` in backend
- [ ] Implement `submitKitRequest()` in `Code.ts` — writes to `KitRequests` sheet
- [ ] Show confirmation toast after successful submission
- [ ] Build `RequestList` component in admin UI
  - Table: brand, model, submitted by, date, note, status
  - Status dropdown (New / Acknowledged / In Progress / Resolved)
  - Admin note field per request
  - Sortable by date and status

**Deliverable:** Sales users can flag missing kits. Admin sees a live request list with status tracking.

---

## Phase 4 — Polish & Hardening

**Goal:** Ensure the application is robust, user-friendly, and ready for real use.

### Tasks

- [ ] Error handling: graceful messages when Sheets API is slow or data is missing
- [ ] Loading states / skeleton screens during data fetch
- [ ] Empty states: "No kit available for this model yet" + prompt to request
- [ ] Accessibility: keyboard navigation, sufficient color contrast, alt text for logos
- [ ] Test with 5+ real kit records across multiple brands
- [ ] Test admin operations: create, edit, soft-delete, restore
- [ ] Test request flow end-to-end
- [ ] Cross-browser check (Chrome, Edge, Safari)
- [ ] Tablet layout review
- [ ] Confirm logo images render correctly from Drive
- [ ] Review and tighten Sheets sharing permissions

**Deliverable:** Stable, tested application. No known blocking issues.

---

## Phase 5 — Deployment & Handover

**Goal:** Live deployment accessible to your team, with admin guidance for ongoing maintenance.

### Tasks

- [ ] Deploy Sales app as GAS Web App (access: anyone in your domain)
- [ ] Deploy Admin app as GAS Web App (access: specific admin emails only)
- [ ] Add bookmarks / shortcuts in Google Drive for both URLs
- [ ] Add all current sales users to `Users` sheet with role `sales`
- [ ] Add all admin users to `Users` sheet with role `admin`
- [ ] Write a short Admin Guide (how to add a kit, manage requests, add a brand)
- [ ] Write a short Sales User Guide (how to look up a kit, how to request one)
- [ ] Run a demo walkthrough with the sales team
- [ ] Confirm all seed/test data removed or replaced with real data

**Deliverable:** Application live and in use. Team trained.

---

## Dependencies & Decision Gates

| Gate | Blocks | Depends On |
|---|---|---|
| OPEN_QUESTIONS.md answered | Phase 0 start | You |
| Brands/models Google Sheet shared | Phase 0 data import | You |
| Brand logos provided | Phase 0 | You |
| Steering kit part numbers confirmed | Phase 1 Kit Detail | OPEN_QUESTIONS Q-3 |
| Google Workspace domain confirmed | Phase 0 auth setup | OPEN_QUESTIONS Q-1 |
| Admin email list provided | Phase 5 | You |

---

## Effort Notes

This plan is structured so that each phase is independently shippable. Phases 0–2 deliver the most business value and should be prioritized. Phases 3–5 can follow in the same sprint or a subsequent one.

Phases are intentionally sized to be manageable within individual Claude Code CLI sessions, with clear inputs and outputs at each boundary.
