# Setup Guide
## Getting the Quantum Connect Kit Configurator running

---

## Prerequisites

- Node.js 18+ installed (`node --version`)
- A Google Workspace account

---

## Step 1 — Install dependencies

```bash
# From the project root
npm install          # installs clasp

cd client
npm install          # installs React, Vite, Tailwind, etc.
cd ..
```

---

## Step 2 — Authenticate with Google (clasp)

```bash
npx clasp login
```

This opens a browser window. Log in with the **Google Workspace account** that will own the Apps Script project (typically an admin account).

---

## Step 3 — Create the Apps Script project

```bash
npx clasp create --type webapp --title "QTC Kit Configurator" --rootDir ./gas
```

This creates a new Google Apps Script project and writes the `scriptId` into `.clasp.json` automatically. You can also do this manually via [script.google.com](https://script.google.com).

---

## Step 4 — Build the React client

```bash
./scripts/build.sh
```

This runs Vite, bundles everything into `gas/index.html`, ready for clasp to push.

---

## Step 5 — Push to Google Apps Script

```bash
npx clasp push
```

All files in `gas/` (TypeScript + HTML) are uploaded to your Apps Script project.

---

## Step 6 — Run the database setup

1. Open the GAS project editor:
   ```bash
   npx clasp open
   ```
2. In the editor, select the **`setupDatabase`** function from the function dropdown
3. Click **Run**
4. Approve any permissions requested (Google Sheets access)

This will:
- Create a new Google Spreadsheet called "QTC Kit Configurator Database"
- Create all required sheets (Brands, Models, Kits, KitRequests, Admins)
- Seed all 45 brands and ~1000 models from the CSV

The spreadsheet ID is automatically saved to Script Properties.

---

## Step 7 — Verify admin users

The following admins are **pre-seeded automatically** by `setupDatabase()`:
- markus.nilsson@steelwrist.com
- peter.andersson@steelwrist.com

To add more admins later: open the spreadsheet → **Admins** sheet → add email in column A.

Anyone in that list has full admin access to the application.

---

## Step 8 — Deploy as Web App

1. In the GAS editor: **Deploy → New Deployment**
2. Settings:
   - **Type**: Web App
   - **Execute as**: Me *(the deployer)*
   - **Who has access**: Anyone in your organization *(your Google Workspace domain)*
3. Click **Deploy**
4. Copy the Web App URL — this is the sales-facing URL

---

## Step 9 — Test

Open the Web App URL in your browser. You should see the Quantum Connect Kit Configurator loading screen.

- As an admin: you'll see the full admin panel
- As a sales user: you'll see the brand grid (empty until you create kit records)

---

## Step 10 — Add kit data

Use the Admin panel → **Kit Database → + New Kit** to create your first kit records.

To add kits for multiple models quickly, edit the Google Spreadsheet's **Kits** sheet directly (each row = one kit). Column headers match the data model in the FSD.

---

## Development workflow (after initial setup)

```bash
# Edit files in client/src/ or gas/
./scripts/build.sh    # rebuild React
npx clasp push        # push to GAS
# Refresh the web app URL to see changes
```

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `SPREADSHEET_ID not set` | Run `setupDatabase()` from GAS editor |
| `Access denied: administrator role required` | Add your email to the Admins sheet |
| Logos not showing | Logos are stored by filename in the Brands sheet; actual image serving via Drive URL to be configured |
| `clasp push` fails | Run `npx clasp login` again |
