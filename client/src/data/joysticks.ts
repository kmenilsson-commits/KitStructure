import type { JoystickSpec } from '../types';

// ─── Joystick catalogue (from document 700811) ───────────────────────────────
// All A9 Quantum joysticks with LED + J1939 CAN

export const LEFT_JOYSTICKS: JoystickSpec[] = [
  {
    partNumber: '803398',
    config: '2A5D',
    description: '2 Axes, 5 Buttons — Standard',
    type: 'Standard',
    hand: 'left',
    defaultFor: 'CEX < 7 ton',
  },
  {
    partNumber: '803402',
    config: '3A6D',
    description: '3 Axes, 6 Buttons — Standard',
    type: 'Standard',
    hand: 'left',
    defaultFor: 'WEX / MEX > 7 ton',
  },
  {
    partNumber: '803389',
    config: '3A6D',
    description: '3 Axes, 6 Buttons — Heat & Haptic',
    type: 'Heat and Haptic',
    hand: 'left',
  },
  {
    partNumber: '803419',
    config: '3A5D FNR',
    description: '3 Axes, 5 Buttons, FNR — Standard',
    type: 'Standard',
    hand: 'left',
    defaultFor: 'Some WEX',
  },
  {
    partNumber: '803427',
    config: '3A5D FNR',
    description: '3 Axes, 5 Buttons, FNR — Heat & Haptic',
    type: 'Heat and Haptic',
    hand: 'left',
  },
];

export const RIGHT_JOYSTICKS: JoystickSpec[] = [
  {
    partNumber: '803399',
    config: '2A5D',
    description: '2 Axes, 5 Buttons — Standard',
    type: 'Standard',
    hand: 'right',
    defaultFor: 'CEX < 7 ton',
  },
  {
    partNumber: '803403',
    config: '3A6D',
    description: '3 Axes, 6 Buttons — Standard',
    type: 'Standard',
    hand: 'right',
    defaultFor: 'MEX > 7 ton',
  },
  {
    partNumber: '803390',
    config: '3A6D',
    description: '3 Axes, 6 Buttons — Heat & Haptic',
    type: 'Heat and Haptic',
    hand: 'right',
  },
  {
    partNumber: '803420',
    config: '3A5D FNR',
    description: '3 Axes, 5 Buttons, FNR — Standard',
    type: 'Standard',
    hand: 'right',
    defaultFor: 'WEX',
  },
  {
    partNumber: '803428',
    config: '3A5D FNR',
    description: '3 Axes, 5 Buttons, FNR — Heat & Haptic',
    type: 'Heat and Haptic',
    hand: 'right',
  },
  {
    partNumber: '803391',
    config: '3A5D FNR MFJ',
    description: '3 Axes, 5 Buttons, FNR — MFJ Heat & Haptic',
    type: 'MFJ',
    hand: 'right',
  },
  {
    partNumber: '803388',
    config: '3A4D FNR MFJ',
    description: '3 Axes, 4 Buttons, FNR — MFJ Heat & Haptic',
    type: 'MFJ',
    hand: 'right',
  },
];

// Wrist supports (optional accessories, always available)
export const WRIST_SUPPORT_LEFT  = { partNumber: '803429', description: 'Wrist Support — Left' };
export const WRIST_SUPPORT_RIGHT = { partNumber: '803430', description: 'Wrist Support — Right' };

// Additional QIO module
export const EXTRA_QIO_MODULE = { partNumber: '614169', description: 'QTC I/O Module additional (placeholder)' };

// External feeder valve reference
export const FEEDER_VALVE_REF = { partNumber: '900XX1', description: 'External feeder valve (customer-supplied, placeholder)' };

// Helper: look up joystick spec by part number
export function getJoystickByPN(pn: string): JoystickSpec | undefined {
  return [...LEFT_JOYSTICKS, ...RIGHT_JOYSTICKS].find(j => j.partNumber === pn);
}
