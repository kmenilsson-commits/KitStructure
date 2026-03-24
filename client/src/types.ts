// ─── Shared types (client-side mirror of GAS Types.ts) ───────────────────────

export interface Brand {
  id: string;
  name: string;
  logoFilename: string;
  active: boolean;
  createdAt: string;
}

export interface Model {
  id: string;
  brandId: string;
  brandName: string;
  name: string;
  tonnage: string;
  machineType: 'CEX' | 'MEX' | 'WEX' | '';
  createdAt: string;
}

export interface Kit {
  id: string;
  modelIds: string;            // JSON array string: ["uuid1","uuid2"]
  status: 'available' | 'coming_soon' | 'hidden';
  cableLength: '10m' | '15m';
  leftJoysticks: string;       // JSON array string: ["803398","803402"]
  rightJoysticks: string;      // JSON array string
  needsFeederValves: boolean;
  needsExtraQio: boolean;
  steeringKits: string;        // JSON array string
  configPartNumber: string;
  prerequisites: string;
  limitations: string;
  updatedAt: string;
  updatedBy: string;
  cableKitPartNumber: string;  // 6-digit machine-specific cable kit part number
  cableKitDescription: string; // max 256 chars
  // Original machine joystick info (admin reference fields)
  joystickRollerType: 'Analog Single' | 'Analog Dual' | 'PWM Single' | 'PWM Dual' | 'Current' | 'Unknown' | '';
  joystickButtonType: 'Standard' | 'SPDT' | 'Namur' | 'Other' | '';
  joystickConnectorType: 'Deutsch DT' | 'Deutsch DTM' | 'AMP' | '';
  joystickConnectorPins: '2' | '4' | '6' | '8' | '10' | '12' | '';
  safetyGateSignal: 'Active High' | 'Active Lo' | '';
  machineType: 'CEX' | 'WEX' | 'MEX' | '';
}

export interface KitRequest {
  id: string;
  brandName: string;
  modelName: string;
  requestedBy: string;
  note: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved';
  createdAt: string;
  adminNote: string;
}

export interface AuthResult {
  email: string;
  role: 'admin' | 'sales';
}

export interface BrandsWithModels {
  brands: Brand[];
  models: Model[];
  kitStatusByModelId: Record<string, 'available' | 'coming_soon'>;
}

export interface AdminData {
  brands: Brand[];
  models: Model[];
  kits: Kit[];
  requests: KitRequest[];
}

// ─── App navigation state ────────────────────────────────────────────────────

export type SalesView =
  | { screen: 'brand-grid' }
  | { screen: 'model-list'; brand: Brand }
  | { screen: 'kit-detail'; brand: Brand; model: Model; kit: Kit | null };

export type AdminView =
  | 'kit-list'
  | 'kit-editor'
  | 'brand-manager'
  | 'request-list';

// ─── Joystick catalogue types ─────────────────────────────────────────────────

export interface JoystickSpec {
  partNumber: string;
  config: string;
  description: string;
  type: 'Standard' | 'Heat and Haptic' | 'MFJ';
  hand: 'left' | 'right';
  defaultFor?: string;
}

// ─── Steering kit types ───────────────────────────────────────────────────────

export interface SteeringKitSpec {
  partNumber: string;
  name: string;
  applicableTo: ('WEX' | 'CEX' | 'MEX')[];
}
