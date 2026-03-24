# Open Questions
## Quantum Connect Kit Configurator

**Date:** 2026-03-24
**Purpose:** These questions must be answered before or during Phase 0. Answers will update FSD.md and IMPLEMENTATION_PLAN.md.

---

## Q-1 — Google Workspace Domain ✅ ANSWERED

> **Answer: Google Workspace domain confirmed.**

Access restricted to the org's Google Workspace domain. Anyone in the domain gets default sales access; admin access is role-gated via a dedicated Admins sheet in the database.

---

## Q-2 — Machine Joystick Steering Kits ⚠️ PLACEHOLDER

> **Status: Using placeholder part numbers. Will be updated when real numbers are confirmed.**

- WEX Steering Kit A: `900001` (placeholder)
- WEX Steering Kit B: `900002` (placeholder)
- CEX/MEX Steering Kit: `900003` (placeholder)

These are editable in the Admin UI once real part numbers are known.

---

## Q-3 — Additional QIO Module ✅ ANSWERED (placeholder)

> **Answer: 6-digit part number starting with 6 — using `614169` as placeholder.**

The "second QIO module" flag in the kit record will display this part number. Updateable in the admin panel.

---

## Q-4 — External Feeder Valves ✅ ANSWERED (placeholder)

> **Answer: Using placeholder reference `900XX1`. Displayed as a notice with part number when flag is set.**

---

## Q-5 — Configuration File Part Numbers ✅ ANSWERED (placeholder)

> **Answer: 6-digit format starting with 6 (e.g. `614001`). Will use that pattern throughout.**

Config file part numbers are free-text in the admin editor; validation will enforce the 6-digit format.

---

## Q-6 — "Coming Soon" Visibility

> **Assumed: Admins control status changes. Full spec visible for Coming Soon kits.**

Still to confirm: should a target release quarter/date be shown to sales users?

---

## Q-7 — Google Sheet Structure ✅ ANSWERED

> **Answer: CSV file `Brands and models.csv` provided — 45 brands, ~1000 models.**

All brands and models are imported from the CSV into the seed data. Logos for 22+ brands also provided.

---

## Q-8 — Brand Logos ✅ ANSWERED

> **Answer: PNG logos provided — copied to `Documents/Brand Logos/`.**

22 B&W + colored variants collected. Logo mapping by brand name handled in the database. Missing brands show text initials as fallback.

---

## Q-9 — Kit Request Notifications

> **Deferred to v2. Currently: request is logged in the database and visible to admins.**

If email notifications are needed: confirm recipient address(es).

---

## Q-10 — Admin Access List ✅ ANSWERED

> **Answer: Two admins confirmed.**
> - markus.nilsson@steelwrist.com
> - peter.andersson@steelwrist.com
>
> These are pre-seeded into the Admins sheet by `setupDatabase()`. Add more by editing the Admins sheet directly.

---

## Q-11 — Machine Types in Your Data

> **Not present in CSV. Machine type (CEX/MEX/WEX) will be set per model by the admin.**

The admin model editor includes a machine type field. Admins set this when creating/editing models.

---

## Q-12 — Tech Stack ✅ ANSWERED

> **Answer: Option A confirmed — Google Apps Script + React + Google Sheets.**

Implementation proceeding with clasp + Vite + React + Tailwind CSS.
