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
  prefillModelId?: string;
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
    modelIds: '[]',
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
    joystickRollerType: '',
    joystickButtonType: '',
    joystickConnectorType: '',
    joystickConnectorPins: '',
    safetyGateSignal: '',
    machineType: '',
  };
}

export default function KitEditor({ kit, brands, models, prefillModelId, onSave, onCancel }: Props) {
  const [form, setForm] = useState<Omit<Kit, 'id' | 'updatedAt' | 'updatedBy'>>(() => {
    if (kit) {
      const { id, updatedAt, updatedBy, ...rest } = kit;
      return rest;
    }
    const empty = buildEmptyKit();
    if (prefillModelId) empty.modelIds = JSON.stringify([prefillModelId]);
    return empty;
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive initial brand from the first selected model (or prefill)
  const initialBrandId = useMemo(() => {
    if (kit) {
      const firstId = parseJsonArray(kit.modelIds)[0];
      return models.find(m => m.id === firstId)?.brandId ?? '';
    }
    if (prefillModelId) {
      return models.find(m => m.id === prefillModelId)?.brandId ?? '';
    }
    return '';
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [pickerBrandId, setPickerBrandId] = useState(initialBrandId);

  const selectedModelIds = parseJsonArray(form.modelIds);

  // All selected model objects
  const selectedModels = useMemo(
    () => selectedModelIds.map(id => models.find(m => m.id === id)).filter(Boolean) as Model[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form.modelIds, models]
  );

  // Primary model drives machineType for steering kits
  const primaryModel = selectedModels.find(m => m.machineType) ?? selectedModels[0];

  const toggleModel = (modelId: string) => {
    const current = parseJsonArray(form.modelIds);
    const updated = current.includes(modelId)
      ? current.filter(id => id !== modelId)
      : [...current, modelId];
    setForm(f => ({ ...f, modelIds: JSON.stringify(updated) }));
  };

  // Reset steering kits when model selection changes (machine type may differ)
  useEffect(() => {
    setForm(f => ({ ...f, steeringKits: '[]' }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.modelIds]);

  // Models available in the picker (filtered by selected picker brand)
  const pickerModels = useMemo(
    () => pickerBrandId ? models.filter(m => m.brandId === pickerBrandId) : [],
    [models, pickerBrandId]
  );

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
    if (selectedModelIds.length === 0) {
      setError('Please select at least one model.');
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
    primaryModel?.machineType
      ? getSteeringKitsForMachineType(primaryModel.machineType)
      : [];

  const titleLabel =
    selectedModels.length === 0
      ? ''
      : selectedModels.length === 1
      ? `${brands.find(b => b.id === selectedModels[0].brandId)?.name ?? ''} ${selectedModels[0].name}`
      : `${selectedModels.length} models`;

  // Build grouped model list for the picker
  const brandById = useMemo(
    () => Object.fromEntries(brands.map(b => [b.id, b])),
    [brands]
  );


  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {kit ? `Edit Kit${titleLabel ? ` — ${titleLabel}` : ''}` : 'New Kit'}
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
        {/* Model selector — brand first, then models within that brand */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Machine
          </h3>

          {/* Selected model tags */}
          {selectedModels.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedModels.map(m => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-sw-orange/10 text-sw-orange border border-sw-orange/20 rounded-full text-xs font-medium"
                >
                  {brandById[m.brandId]?.name} {m.name}
                  <button
                    type="button"
                    onClick={() => toggleModel(m.id)}
                    className="hover:text-orange-700 ml-0.5"
                    aria-label={`Remove ${m.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Brand picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
              <select
                value={pickerBrandId}
                onChange={e => setPickerBrandId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
              >
                <option value="">Select brand…</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Model checklist for selected brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Models{pickerBrandId ? ` — check all that apply` : ''}
              </label>
              <div className={`border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto ${!pickerBrandId ? 'bg-gray-50' : ''}`}>
                {!pickerBrandId ? (
                  <p className="text-xs text-gray-400 px-3 py-3">Select a brand first.</p>
                ) : pickerModels.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-3">No models for this brand.</p>
                ) : (
                  pickerModels.map(m => {
                    const checked = selectedModelIds.includes(m.id);
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-sm ${
                          checked ? 'bg-orange-50' : ''
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModel(m.id)}
                          className="w-4 h-4 accent-sw-orange shrink-0"
                        />
                        <span className="flex-1 text-gray-800">{m.name}</span>
                        {m.tonnage && <span className="text-xs text-gray-400">{m.tonnage} t</span>}
                        {m.machineType && (
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded-full">
                            {m.machineType}
                          </span>
                        )}
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            {selectedModelIds.length === 0
              ? 'No models selected'
              : `${selectedModelIds.length} model${selectedModelIds.length !== 1 ? 's' : ''} selected`}
            {primaryModel?.machineType && (
              <> · Machine type: <strong>{primaryModel.machineType}</strong></>
            )}
          </p>
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

        {/* Steering Kits (only if primary model has machineType) */}
        {primaryModel?.machineType && steeringOptions.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Machine Steering Kits{' '}
              <span className="normal-case text-gray-400 font-normal">
                ({primaryModel.machineType})
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

        {/* Original Machine Joystick Info */}
        <section>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
            Original Machine Joystick Info
          </h3>
          <p className="text-xs text-gray-400 mb-4">Reference data about the machine's existing joystick setup.</p>
          <div className="space-y-5">

            {/* Roller Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Roller Type</label>
              <div className="flex flex-wrap gap-2">
                {(['Analog Single', 'Analog Dual', 'PWM Single', 'PWM Dual', 'Current', 'Unknown'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.joystickRollerType === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="joystickRollerType" value={v} checked={form.joystickRollerType === v} onChange={() => setForm(f => ({ ...f, joystickRollerType: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.joystickRollerType && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, joystickRollerType: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
            </div>

            {/* Button Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Button Type</label>
              <div className="flex flex-wrap gap-2">
                {(['Standard', 'SPDT', 'Namur', 'Other'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.joystickButtonType === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="joystickButtonType" value={v} checked={form.joystickButtonType === v} onChange={() => setForm(f => ({ ...f, joystickButtonType: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.joystickButtonType && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, joystickButtonType: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
            </div>

            {/* Connector Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connector Type</label>
              <div className="flex flex-wrap gap-2">
                {(['Deutsch DT', 'Deutsch DTM', 'AMP'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.joystickConnectorType === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="joystickConnectorType" value={v} checked={form.joystickConnectorType === v} onChange={() => setForm(f => ({ ...f, joystickConnectorType: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.joystickConnectorType && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, joystickConnectorType: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
            </div>

            {/* Connector Pins */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Connector Pins</label>
              <div className="flex flex-wrap gap-2">
                {(['2', '4', '6', '8', '10', '12'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.joystickConnectorPins === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="joystickConnectorPins" value={v} checked={form.joystickConnectorPins === v} onChange={() => setForm(f => ({ ...f, joystickConnectorPins: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.joystickConnectorPins && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, joystickConnectorPins: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
            </div>

            {/* Safety Gate Signal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Safety Gate Signal</label>
              <div className="flex flex-wrap gap-2">
                {(['Active High', 'Active Lo'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.safetyGateSignal === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="safetyGateSignal" value={v} checked={form.safetyGateSignal === v} onChange={() => setForm(f => ({ ...f, safetyGateSignal: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.safetyGateSignal && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, safetyGateSignal: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
            </div>

            {/* Machine Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Machine Type</label>
              <div className="flex flex-wrap gap-2">
                {(['CEX', 'WEX', 'MEX'] as const).map(v => (
                  <label key={v} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer text-sm transition-colors ${form.machineType === v ? 'border-sw-orange bg-orange-50 text-sw-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    <input type="radio" name="kitMachineType" value={v} checked={form.machineType === v} onChange={() => setForm(f => ({ ...f, machineType: v }))} className="sr-only" />
                    {v}
                  </label>
                ))}
                {form.machineType && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, machineType: '' }))} className="px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 border border-dashed border-gray-200 rounded-lg">Clear</button>
                )}
              </div>
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
