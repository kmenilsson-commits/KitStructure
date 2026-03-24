# Functional Specification Document
## Quantum Connect Kit Configurator — Sales Lookup Tool

**Version:** 0.1 (Draft for Review)
**Date:** 2026-03-24
**Status:** Pending answers to open questions (see OPEN_QUESTIONS.md)

---

## 1. Purpose & Background

The Quantum Connect (QTC) Kit Configurator is an internal web application that enables sales staff to quickly determine whether a finished Quantum Connect kit exists for a specific excavator brand and model. For each available kit the application presents what components are included, any prerequisites or limitations, and the part number of the machine-specific configuration file.

A secondary goal is to give administrators a structured interface to maintain and expand the kit database without requiring technical involvement.

---

## 2. User Roles

| Role | Description | Access |
|---|---|---|
| **Sales User** | Field sales, inside sales | Read-only lookup interface |
| **Administrator** | Product/engineering team | Full read/write to kit database |

Authentication is handled via Google (reusing Google Drive / Google Workspace credentials). Role assignment is managed by the administrator.

---

## 3. Sales User Interface

### 3.1 Brand Selection Screen

The entry point is a visual grid (matrix) of excavator brand logos.

- Each cell displays the brand logo and brand name.
- Only brands that have at least one kit with status **Available** or **Coming Soon** are shown.
- Clicking a brand logo navigates to the Model Selection screen for that brand.
- A search/filter field above the grid allows typing a brand name to filter the matrix.

### 3.2 Model Selection Screen

After selecting a brand, a list of that brand's machine models is displayed.

- Each row shows: model name, tonnage class, and a status badge.
- Status badges:
  - **Available** — kit exists and is ready to order
  - **Coming Soon** — kit is in preparation
  - (Models without a kit are not shown to sales users)
- Clicking a model row navigates to the Kit Detail screen.
- A back-button returns to the Brand Selection screen.

### 3.3 Kit Detail Screen

Displays the full kit specification for the selected brand/model combination.

#### 3.3.1 Header
- Brand name + logo
- Machine model name + tonnage
- Status badge (Available / Coming Soon)

#### 3.3.2 Base Kit

The base kit (614168) is always included. Displayed as a fixed summary card:

| Component | Part Number | Qty |
|---|---|---|
| QTC CAN/Power Hub | 803415 | 1 |
| QTC Display | 803414 | 1 |
| QTC Connectivity Gateway (QCG) | 803416 | 1 |
| QTC I/O Module Master | 803210 | 1 |
| Switch, QC Contura V | 801065 | 1 |
| XCG2 Ball-Joint Display Holder Kit | 801075 | 1 |
| Mounting kit CM XCG2 RF generic | 600947 | 1 |
| *...cables, labels, accessories* | | |

> The base kit section is static; its content does not vary per machine.

#### 3.3.3 Machine-Specific Configuration

The following fields are machine-specific and stored in the kit database:

**Boom/Arm Cable**

One cable length is selected per kit:

| Option | Part Number |
|---|---|
| Cable Excavator QTC 8P — 10 m | 803411 |
| Cable Excavator QTC 8P — 15 m | 803410 |

**Joystick Options**

For each side (Left / Right), the kit may allow one or more A9 joystick variants. The interface shows which variants are valid for this kit. If only a subset of joysticks works, a note explains why. (CEX=Compact Excavator <7 ton, WEX = Wheeled Excavator, MEX =Track Excavator > 7 ton. One Joystick of each Left/Right will be flagged as standard

*Left joystick variants:*

| Part Number | Config | Type |
|---|---|---|
| 803398 | 2A5D | (Default CEX < 7 ton) |
| 803402 | 3A6D | (Default WEX/MEX > 7 ton) |
| 803389 | 3A6D | Heat and Haptic |
| 803419 | 3A5D FNR | Used on some WEX |
| 803427 | 3A5D FNR | Heat and Haptic |

*Right joystick variants:*

| Part Number | Config | Type |
|---|---|---|
| 803399 | 2A5D | (Default CEX < 7 ton) |
| 803403 | 3A6D | (Default MEX > 7 ton) |
| 803390 | 3A6D | Heat and Haptic |
| 803420 | 3A5D FNR | (Default WEX) |
| 803428 | 3A5D FNR | Heat and Haptic |
| 803391 | 3A5D FNR MFJ | Heat and Haptic |
| 803388 | 3A4D FNR MFJ | Heat and Haptic |

**Optional Add-ons**

| Add-on | Shown when |
|---|---|
| External feeder valves required | Flag set in kit record |
| Additional QIO module required | Flag set in kit record |
| Wrist support L (803429) / R (803430) | Always available as optional accessory for left and right A9 Joystick |

**Machine Joystick Steering Kit**

Conditional on machine type:

- *Wheeled excavator (WEX)*: two steering kit options may be offered (admin selects which apply).
- *Tracked excavator (CEX/MEX)*: one steering kit option may be offered.
- *Not applicable*: field hidden but indicates not possible.

*(Exact part numbers for steering kits to be confirmed — see OPEN_QUESTIONS.md Q-3)*

**Configuration File**

| Field | Value |
|---|---|
| Config file part number | e.g. `CFG-XXXX-BRAND-MODEL` |

#### 3.3.4 Prerequisites & Limitations

Free-text field(s) entered by the administrator, displayed as a highlighted notice block. Examples:
- "Requires dealer-installed feeder valve during installation."
- "Only joystick variants 803402 / 803403 are compatible with this machine's CAN bus."

#### 3.3.5 Request a Kit (Call-to-Action)

If the sales user is viewing a **Coming Soon** kit, or if they navigate to a page where no kit exists yet (edge case via direct link), a **"Request this kit"** button is shown. Clicking it:

1. Confirms the brand and model.
2. Optionally lets the user add a note (customer name, urgency).
3. Submits a request record that is visible in the admin interface.
4. Shows a confirmation message.

---

## 4. Administrator Interface

### 4.1 Access

Accessible from a separate URL / restricted folder within the Google Drive domain. Only users with the Administrator role can access this section.

### 4.2 Kit Database List View

A sortable, filterable table of all kit records with columns:

| Column | Sortable | Filterable |
|---|---|---|
| Brand | Yes | Yes |
| Model | Yes | Yes |
| Tonnage | Yes | Yes |
| Status | Yes | Yes (dropdown) |
| Cable Length | No | No |
| Config File P/N | No | No |
| Last Updated | Yes | No |

Actions per row:
- **Edit** — opens the kit editor (see 4.3)
- **Delete** — soft-delete (hides from sales view; record retained)

A **+ New Kit** button opens the kit editor for a new record.

### 4.3 Kit Editor

A form with all kit fields:

- Brand (dropdown, from brand list)
- Model (text + tonnage)
- Machine type (CEX / MEX / WEX — determines steering kit options shown)
- Status (Available / Coming Soon / Hidden)
- Cable length (radio: 10 m / 15 m)
- Left joystick(s) allowed (multi-select checkboxes)
- Right joystick(s) allowed (multi-select checkboxes)
- Flags: External feeder valves needed, Additional QIO module needed
- Steering kit options (conditional on machine type)
- Config file part number (text)
- Prerequisites text (rich-text or multi-line)
- Limitations text (rich-text or multi-line)

### 4.4 Brand & Model Management

Separate admin section to manage the brand list:
- Add / edit / remove brands
- Upload / replace brand logo
- Add / remove models per brand (including tonnage)

### 4.5 Kit Requests

A list of all sales-submitted kit requests, showing:
- Brand + Model requested
- Submitted by (user name/email)
- Date
- Note
- Status (New / Acknowledged / In Progress / Resolved)

Administrators can update the status and add internal notes.

---

## 5. Data Model (Logical)

```
Brand
  id, name, logo_url, active (bool), created_at

Model
  id, brand_id, name, tonnage, machine_type (CEX|MEX|WEX), created_at

Kit
  id, model_id, status (available|coming_soon|hidden)
  cable_length (10m|15m)
  left_joystick_ids[]     -- array of allowed part numbers
  right_joystick_ids[]    -- array of allowed part numbers
  needs_feeder_valves (bool)
  needs_extra_qio (bool)
  steering_kit_options[]  -- array of applicable steering kit part numbers
  config_file_part_number (string)
  prerequisites (text)
  limitations (text)
  updated_at, updated_by

KitRequest
  id, brand_name, model_name, requested_by_email, note, status, created_at, admin_note
```

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Authentication | Google Workspace OAuth (reuse Drive credentials) |
| Authorization | Role-based: Sales (read) / Admin (read+write) |
| Availability | Google infrastructure; no dedicated server required |
| Device support | Desktop-first; tablet-friendly |
| Language | English (v1) |
| Performance | Page load < 2 s on standard corporate network |
| Data privacy | Internal only; no public access |

---

## 7. Out of Scope (v1)

- Price / lead-time display
- Direct ERP or ordering system integration
- Multi-language support
- Mobile-native app
- Automated email notifications for kit requests (may add in v2)

---

## 8. Open Items

See **OPEN_QUESTIONS.md** for a list of questions that must be answered before implementation begins.
