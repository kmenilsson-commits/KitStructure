import { useState, useEffect, useMemo } from 'react';
import { Loader2, X } from 'lucide-react';
import type { Brand, Model, Kit } from '../../types';
import {
  LEFT_JOYSTICKS,
  RIGHT_JOYSTICKS,
} from '../../data/joysticks';
import { getSteeringKitsForMachineType } from '../../data/steeringKits';

interface Props {
  kit: Kit | null;
  brands: Brand[];
  models: Model[];
  onSave: (kit: Kit) => Promise<void>;
  onCancel: () => void;
}

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function buildEmptyKit(): Omit<Kit, 'id' | 'updatedAt' | 'updatedBy'> {
  return {
    modelId: '',
    status: 'coming_soon',
    cableLength: '10m',
    leftJoysticks: '[]',
    rightJoysticks: '[]',
    needsFeederValves: false,
    needsExtraQio: false,
    steeringKits: '[]',
    configPartNumber: '',
    prerequisites: '',
    limitations: '',
    cableKitPartNumber: '',
    cableKitDescription: '',
  };
}

export default function KitEditor({ kit, brands, models, onSave, onCancel }: Props) {
  // Derive initial brand from kit's model
  const initialModel = kit ? models.find((m) => m.id === kit.modelId) : undefined;
  const initialBrandId = initialModel?.brandId ?? '';

  const [selectedBrandId, setSelectedBrandId] = useState(initialBrandId);
  const [form, setForm] = useState<Omit<Kit, 'id' | 'updatedAt' | 'updatedBy'>>(() => {
    if (kit) {
      const { id, updatedAt, updatedBy, ...rest } = kit;
      return rest;
    }
    return buildEmptyKit();
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredModels = useMemo(
    () => models.filter((m) => m.brandId === selectedBrandId),
    [models, selectedBrandId]
  );

  const selectedModel = useMemo(
    () => models.find((m) => m.id === form.modelId),
    [models, form.modelId]
  );

  // When brand changes, reset model selection
  const handleBrandChange = (brandId: string) => {
    setSelectedBrandId(brandId);
    setForm((f) => ({ ...f, modelId: '' }));
  };

  // Keep steeringKits in sync when model changes (clear if machine type changes)
  useEffect(() => {
    // Reset steering kits when model changes
    setForm((f) => ({ ...f, steeringKits: '[]' }));
  }, [form.modelId]);

  const leftSelected = parseJsonArray(form.leftJoysticks);
  const rightSelected = parseJsonArray(form.rightJoysticks);
  const steeringSelected = parseJsonArray(form.steeringKits);

  const toggleArrayItem = (
    field: 'leftJoysticks' | 'rightJoysticks' | 'steeringKits',
    value: string
  ) => {
    const current = parseJsonArray(form[field]);
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setForm((f) => ({ ...f, [field]: JSON.stringify(updated) }));
  };

  const handleSave = async () => {
    if (!form.modelId) {
      setError('Please select a model.');
      return;
    }
    if (!form.configPartNumber.trim()) {
      setError('Configuration part number is required.');
      return;
    }
    if (form.cableKitPartNumber && form.cableKitPartNumber.length !== 6) {
      setError('Cable kit part number must be exactly 6 digits.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const kitToSave: Kit = {
        id: kit?.id ?? '',
        updatedAt: kit?.updatedAt ?? '',
        updatedBy: kit?.updatedBy ?? '',
        ...form,
      };
      await onSave(kitToSave);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save kit.');
      setSaving(false);
    }
  };

  const steeringOptions =
    selectedModel?.machineType
      ? getSteeringKitsForMachineType(selectedModel.machineType)
      : [];

  const titleModel = selectedModel
    ? `${brands.find((b) => b.id === selectedModel.brandId)?.name ?? ''} ${selectedModel.name}`
    : '';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {kit ? `Edit Kit — ${titleModel}` : 'New Kit'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {kit ? 'Update kit details below.' : 'Configure a new Quantum Connect kit.'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-7 max-w-3xl">
        {/* Brand + Model */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Machine
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
              <select
                value={selectedBrandId}
                onChange={(e) => handleBrandChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
              >
                <option value="">Select brand…</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
              <select
                value={form.modelId}
                onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))}
                disabled={!selectedBrandId}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">Select model…</option>
                {filteredModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                    {m.tonnage ? ` (${m.tonnage} t)` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedModel && (
            <div className="mt-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              Machine type:{' '}
              <strong>{selectedModel.machineType || 'Not set'}</strong>
              {selectedModel.tonnage && (
                <>
                  {' '}· Tonnage: <strong>{selectedModel.tonnage} t</strong>
                </>
              )}
            </div>
          )}
        </section>

        {/* Status */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Status
          </h3>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { value: 'available', label: 'Available' },
                { value: 'coming_soon', label: 'Coming Soon' },
                { value: 'hidden', label: 'Hidden' },
              ] as const
            ).map(({ value, label }) => (
              <label
                key={value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  form.status === value
                    ? 'border-sw-orange bg-orange-50 text-sw-orange'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={value}
                  checked={form.status === value}
                  onChange={() => setForm((f) => ({ ...f, status: value }))}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* Cable Length */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Boom / Arm Cable Length
          </h3>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { value: '10m', label: '10 m', pn: '803411' },
                { value: '15m', label: '15 m', pn: '803410' },
              ] as const
            ).map(({ value, label, pn }) => (
              <label
                key={value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                  form.cableLength === value
                    ? 'border-sw-orange bg-orange-50 text-sw-orange'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="cableLength"
                  value={value}
                  checked={form.cableLength === value}
                  onChange={() => setForm((f) => ({ ...f, cableLength: value }))}
                  className="sr-only"
                />
                {label}{' '}
                <span className="font-mono text-xs text-gray-400">({pn})</span>
              </label>
            ))}
          </div>
        </section>

        {/* Left Joysticks */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Left Joystick Variants
          </h3>
          <div className="space-y-2">
            {LEFT_JOYSTICKS.map((j) => (
              <label
                key={j.partNumber}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={leftSelected.includes(j.partNumber)}
                  onChange={() => toggleArrayItem('leftJoysticks', j.partNumber)}
                  className="w-4 h-4 accent-sw-orange"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{j.description}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{j.partNumber}</span>
                  {j.config && (
                    <span className="ml-2 text-xs text-gray-500">· {j.config}</span>
                  )}
                </div>
                {j.defaultFor && (
                  <span className="text-xs text-gray-400 italic shrink-0">
                    Default: {j.defaultFor}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Right Joysticks */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Right Joystick Variants
          </h3>
          <div className="space-y-2">
            {RIGHT_JOYSTICKS.map((j) => (
              <label
                key={j.partNumber}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={rightSelected.includes(j.partNumber)}
                  onChange={() => toggleArrayItem('rightJoysticks', j.partNumber)}
                  className="w-4 h-4 accent-sw-orange"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{j.description}</span>
                  <span className="ml-2 text-xs text-gray-400 font-mono">{j.partNumber}</span>
                  {j.config && (
                    <span className="ml-2 text-xs text-gray-500">· {j.config}</span>
                  )}
                </div>
                {j.defaultFor && (
                  <span className="text-xs text-gray-400 italic shrink-0">
                    Default: {j.defaultFor}
                  </span>
                )}
              </label>
            ))}
          </div>
        </section>

        {/* Flags */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Add-ons / Flags
          </h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.needsFeederValves}
                onChange={(e) =>
                  setForm((f) => ({ ...f, needsFeederValves: e.target.checked }))
                }
                className="w-4 h-4 accent-sw-orange"
              />
              <span className="text-sm text-gray-700">
                Requires external feeder valve{' '}
                <span className="text-gray-400 font-mono text-xs">(900XX1)</span>
              </span>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={form.needsExtraQio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, needsExtraQio: e.target.checked }))
                }
                className="w-4 h-4 accent-sw-orange"
              />
              <span className="text-sm text-gray-700">
                Requires additional QIO module{' '}
                <span className="text-gray-400 font-mono text-xs">(614169)</span>
              </span>
            </label>
          </div>
        </section>

        {/* Steering Kits (only if model has machineType) */}
        {selectedModel?.machineType && steeringOptions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Machine Steering Kits{' '}
              <span className="normal-case text-gray-400 font-normal">
                ({selectedModel.machineType})
              </span>
            </h3>
            <div className="space-y-2">
              {steeringOptions.map((sk) => (
                <label
                  key={sk.partNumber}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={steeringSelected.includes(sk.partNumber)}
                    onChange={() => toggleArrayItem('steeringKits', sk.partNumber)}
                    className="w-4 h-4 accent-sw-orange"
                  />
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">{sk.name}</span>
                    <span className="ml-2 text-xs text-gray-400 font-mono">{sk.partNumber}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Config Part Number */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Configuration File
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Part Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.configPartNumber}
              onChange={(e) =>
                setForm((f) => ({ ...f, configPartNumber: e.target.value }))
              }
              placeholder="614001"
              className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
            />
          </div>
        </section>

        {/* Machine-specific Cable Kit */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Machine Cable Kit
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cable Kit Part Number{' '}
                <span className="text-gray-400 font-normal">(6 digits)</span>
              </label>
              <input
                type="text"
                value={form.cableKitPartNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setForm((f) => ({ ...f, cableKitPartNumber: val }));
                }}
                placeholder="6XXXXX"
                maxLength={6}
                className="w-full max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
              />
              {form.cableKitPartNumber && form.cableKitPartNumber.length !== 6 && (
                <p className="mt-1 text-xs text-rose-500">Must be exactly 6 digits.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Cable Kit Description{' '}
                <span className="text-gray-400 font-normal">(max 256 characters)</span>
              </label>
              <textarea
                value={form.cableKitDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cableKitDescription: e.target.value.slice(0, 256) }))
                }
                rows={2}
                maxLength={256}
                placeholder="e.g. Machine-specific cable harness for Volvo EC480E…"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400 text-right">
                {form.cableKitDescription.length}/256
              </p>
            </div>
          </div>
        </section>

        {/* Prerequisites */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Prerequisites
          </h3>
          <textarea
            value={form.prerequisites}
            onChange={(e) => setForm((f) => ({ ...f, prerequisites: e.target.value }))}
            rows={3}
            placeholder="Any prerequisites the installer must fulfil before installing this kit…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
          />
        </section>

        {/* Limitations */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Limitations
          </h3>
          <textarea
            value={form.limitations}
            onChange={(e) => setForm((f) => ({ ...f, limitations: e.target.value }))}
            rows={3}
            placeholder="Known limitations or incompatibilities…"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
          />
        </section>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 pb-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-sw-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              'Save Kit'
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
