// ─── Shared type definitions for GAS backend ───────────────────────────────
// Note: No import/export — GAS uses a shared global namespace across files.

interface Brand {
  id: string;
  name: string;
  logoFilename: string;   // filename in Drive logo folder (e.g. "Volvo_logo.png")
  active: boolean;
  createdAt: string;
}

interface Model {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  tonnage: string;
  machineType: string;  // "CEX" | "MEX" | "WEX" | ""
  createdAt: string;
}

interface Kit {
  id: string;
  modelIds: string;            // JSON array of model ID strings e.g. ["uuid1","uuid2"]
  status: string;              // "available" | "coming_soon" | "hidden"
  cableLength: string;         // "10m" | "15m"
  leftJoysticks: string;       // JSON array of part number strings
  rightJoysticks: string;      // JSON array of part number strings
  needsFeederValves: boolean;
  needsExtraQio: boolean;
  steeringKits: string;        // JSON array of part number strings
  configPartNumber: string;
  prerequisites: string;
  limitations: string;
  updatedAt: string;
  updatedBy: string;
  cableKitPartNumber: string;  // 6-digit machine-specific cable kit part number
  cableKitDescription: string; // max 256 chars
  // Original machine joystick info (admin reference fields)
  joystickRollerType: string;    // "Analog Single" | "Analog Dual" | "PWM Single" | "PWM Dual" | "Current" | "Unknown"
  joystickButtonType: string;    // "Standard" | "SPDT" | "Namur" | "Other"
  joystickConnectorType: string; // "Deutsch DT" | "Deutsch DTM" | "AMP"
  joystickConnectorPins: string; // "2" | "4" | "6" | "8" | "10" | "12"
  safetyGateSignal: string;      // "Active High" | "Active Lo"
  machineType: string;           // "CEX" | "WEX" | "MEX"
}

interface KitRequest {
  id: string;
  brandName: string;
  modelName: string;
  requestedBy: string;
  note: string;
  status: string;      // "new" | "acknowledged" | "in_progress" | "resolved"
  createdAt: string;
  adminNote: string;
}

interface AuthResult {
  email: string;
  role: string;  // "admin" | "sales"
}

// Column index maps (1-based, matching Sheets columns)
const BRAND_COLS = { id: 1, name: 2, logoFilename: 3, active: 4, createdAt: 5 };
const MODEL_COLS = { id: 1, brandId: 2, brandName: 3, name: 4, tonnage: 5, machineType: 6, createdAt: 7 };
const KIT_COLS   = { id: 1, modelIds: 2, status: 3, cableLength: 4, leftJoysticks: 5, rightJoysticks: 6, needsFeederValves: 7, needsExtraQio: 8, steeringKits: 9, configPartNumber: 10, prerequisites: 11, limitations: 12, updatedAt: 13, updatedBy: 14, cableKitPartNumber: 15, cableKitDescription: 16, joystickRollerType: 17, joystickButtonType: 18, joystickConnectorType: 19, joystickConnectorPins: 20, safetyGateSignal: 21, machineType: 22 };
const REQ_COLS   = { id: 1, brandName: 2, modelName: 3, requestedBy: 4, note: 5, status: 6, createdAt: 7, adminNote: 8 };
const ADMIN_COLS = { email: 1 };

// Sheet names
const SHEET_BRANDS    = 'Brands';
const SHEET_MODELS    = 'Models';
const SHEET_KITS      = 'Kits';
const SHEET_REQUESTS  = 'KitRequests';
const SHEET_ADMINS    = 'Admins';

// The ID of the Google Sheets spreadsheet that serves as the database.
// Set this after running setupDatabase() for the first time.
const SPREADSHEET_ID = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '';
