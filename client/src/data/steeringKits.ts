import type { SteeringKitSpec } from '../types';

// ─── Machine Joystick Steering Kits (placeholder part numbers) ───────────────
// Update these part numbers in the admin panel once confirmed.

export const STEERING_KITS: SteeringKitSpec[] = [
  {
    partNumber: '900001',
    name: 'WEX Steering Kit A (placeholder)',
    applicableTo: ['WEX'],
  },
  {
    partNumber: '900002',
    name: 'WEX Steering Kit B (placeholder)',
    applicableTo: ['WEX'],
  },
  {
    partNumber: '900003',
    name: 'CEX/MEX Steering Kit (placeholder)',
    applicableTo: ['CEX', 'MEX'],
  },
];

export function getSteeringKitByPN(pn: string): SteeringKitSpec | undefined {
  return STEERING_KITS.find(k => k.partNumber === pn);
}

export function getSteeringKitsForMachineType(machineType: string): SteeringKitSpec[] {
  return STEERING_KITS.filter(k =>
    k.applicableTo.includes(machineType as 'WEX' | 'CEX' | 'MEX')
  );
}
