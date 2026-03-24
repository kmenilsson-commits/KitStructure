import { useState } from 'react';
import { ArrowLeft, AlertTriangle, AlertCircle, Info, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import type { Brand, Model, Kit } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import {
  getJoystickByPN,
  WRIST_SUPPORT_LEFT,
  WRIST_SUPPORT_RIGHT,
  EXTRA_QIO_MODULE,
  FEEDER_VALVE_REF,
} from '../../data/joysticks';
import { getSteeringKitByPN } from '../../data/steeringKits';

interface Props {
  brand: Brand;
  model: Model;
  kit: Kit | null;
  onBack: () => void;
  onRequestKit: () => void;
}

const BASE_KIT_COMPONENTS = [
  { description: 'QTC CAN/Power Hub', partNumber: '803415' },
  { description: 'QTC Display', partNumber: '803414' },
  { description: 'QTC Connectivity Gateway (QCG)', partNumber: '803416' },
  { description: 'QTC I/O Module Master', partNumber: '803210' },
  { description: 'Switch QC Contura V', partNumber: '801065' },
  { description: 'XCG2 Ball-Joint Display Holder', partNumber: '801075' },
  { description: 'Mounting kit CM XCG2 RF generic', partNumber: '600947' },
];

const MACHINE_TYPE_CLASSES: Record<string, string> = {
  CEX: 'bg-blue-100 text-blue-700 border border-blue-200',
  MEX: 'bg-violet-100 text-violet-700 border border-violet-200',
  WEX: 'bg-teal-100 text-teal-700 border border-teal-200',
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function PartRow({ description, partNumber }: { description: string; partNumber: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm border-b border-gray-50 last:border-0">
      <span className="text-gray-700">{description}</span>
      <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
        {partNumber}
      </span>
    </div>
  );
}

export default function KitDetail({ brand, model, kit, onBack, onRequestKit }: Props) {
  const [baseKitOpen, setBaseKitOpen] = useState(false);

  const parseJsonArray = (raw: string): string[] => {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const leftPNs = kit ? parseJsonArray(kit.leftJoysticks) : [];
  const rightPNs = kit ? parseJsonArray(kit.rightJoysticks) : [];
  const steeringPNs = kit ? parseJsonArray(kit.steeringKits) : [];

  const hasSteeringKits = steeringPNs.length > 0 && model.machineType !== '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sw-orange transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to models
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">{brand.name}</span>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{model.name}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {model.machineType && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                MACHINE_TYPE_CLASSES[model.machineType] ??
                'bg-gray-100 text-gray-600 border border-gray-200'
              }`}
            >
              {model.machineType}
            </span>
          )}
          {model.tonnage && (
            <span className="text-sm text-gray-500">{model.tonnage} t</span>
          )}
          {kit && <StatusBadge status={kit.status} size="md" />}
        </div>
      </div>

      {/* No kit */}
      {!kit && (
        <EmptyState
          title="No kit available yet"
          description="A Quantum Connect kit for this model hasn't been configured yet. You can request one and our engineering team will review it."
          action={
            <button
              onClick={onRequestKit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sw-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
            >
              Request this kit
            </button>
          }
        />
      )}

      {kit && (
        <div className="space-y-5">
          {/* 1. Base Kit — collapsible */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setBaseKitOpen((o) => !o)}
              className="w-full flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Base Kit — 614168
              </h3>
              {baseKitOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            {baseKitOpen && (
              <div className="p-5">
                {BASE_KIT_COMPONENTS.map((c) => (
                  <PartRow key={c.partNumber} description={c.description} partNumber={c.partNumber} />
                ))}
                <p className="mt-3 text-xs text-gray-400 italic">
                  Cables, labels and accessories included
                </p>
              </div>
            )}
          </div>

          {/* 2. Boom/Arm Cable */}
          <Card title="Boom / Arm Cable">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {kit.cableLength === '10m' ? '10 m' : '15 m'} Boom/Arm Cable
              </span>
              <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                {kit.cableLength === '10m' ? '803411' : '803410'}
              </span>
            </div>
          </Card>

          {/* 3. Joysticks */}
          <Card title="Joysticks">
            <div className="space-y-4">
              {/* Left */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Left Joystick
                </h4>
                {leftPNs.length === 0 ? (
                  <p className="text-xs text-gray-400">No left joystick variants specified.</p>
                ) : (
                  <div className="space-y-1">
                    {leftPNs.map((pn) => {
                      const spec = getJoystickByPN(pn);
                      return (
                        <div
                          key={pn}
                          className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                              {pn}
                            </span>
                            {spec ? (
                              <span className="text-gray-700">
                                {spec.config} — {spec.description}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Unknown part</span>
                            )}
                          </div>
                          {spec?.defaultFor && (
                            <span className="text-xs bg-sw-orange/10 text-sw-orange border border-sw-orange/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
                              Default
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Right Joystick
                </h4>
                {rightPNs.length === 0 ? (
                  <p className="text-xs text-gray-400">No right joystick variants specified.</p>
                ) : (
                  <div className="space-y-1">
                    {rightPNs.map((pn) => {
                      const spec = getJoystickByPN(pn);
                      return (
                        <div
                          key={pn}
                          className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                              {pn}
                            </span>
                            {spec ? (
                              <span className="text-gray-700">
                                {spec.config} — {spec.description}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">Unknown part</span>
                            )}
                          </div>
                          {spec?.defaultFor && (
                            <span className="text-xs bg-sw-orange/10 text-sw-orange border border-sw-orange/20 px-2 py-0.5 rounded-full font-medium whitespace-nowrap ml-2">
                              Default
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Wrist support accessories */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Optional Accessories
                </h4>
                <div className="space-y-1">
                  {[WRIST_SUPPORT_LEFT, WRIST_SUPPORT_RIGHT].map((ws) => (
                    <div
                      key={ws.partNumber}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm"
                    >
                      <span className="text-gray-600 italic">{ws.description}</span>
                      <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {ws.partNumber}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* 4. Configuration File */}
          <Card title="Configuration File">
            <div className="flex flex-col items-start gap-1">
              <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                {kit.configPartNumber || '—'}
              </span>
              <span className="text-xs text-gray-400">Machine-specific configuration file</span>
            </div>
          </Card>

          {/* 5. Machine Cable Kit — always shown */}
          <Card title="Machine Cable Kit">
            {kit.cableKitPartNumber ? (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                    {kit.cableKitPartNumber}
                  </span>
                  {kit.cableKitDescription && (
                    <p className="mt-1 text-sm text-gray-600">{kit.cableKitDescription}</p>
                  )}
                  <span className="block mt-1 text-xs text-gray-400">Machine-specific cable kit</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Not configured for this model</p>
            )}
          </Card>

          {/* 6. Machine / Model Specific Drawings */}
          {kit.drawingsPartNumber && (
            <Card title="Machine / Model Specific Drawings">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-2xl font-bold text-gray-800 tracking-wider">
                    {kit.drawingsPartNumber}
                  </span>
                  {kit.drawingsDescription && (
                    <p className="mt-1 text-sm text-gray-600">{kit.drawingsDescription}</p>
                  )}
                  <span className="block mt-1 text-xs text-gray-400">Machine/model specific drawings</span>
                </div>
              </div>
            </Card>
          )}

          {/* 7. Optional Add-ons */}
          {(kit.needsFeederValves || kit.needsExtraQio) && (
            <Card title="Optional Add-ons">
              <div className="space-y-3">
                {kit.needsFeederValves && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-amber-800">External Feeder Valve Required</div>
                      <div className="text-amber-700 mt-0.5">
                        {FEEDER_VALVE_REF.description}
                        <span className="ml-2 font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">
                          {FEEDER_VALVE_REF.partNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {kit.needsExtraQio && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-800">Additional QIO Module Required</div>
                      <div className="text-blue-700 mt-0.5">
                        {EXTRA_QIO_MODULE.description}
                        <span className="ml-2 font-mono text-xs bg-blue-100 px-1.5 py-0.5 rounded">
                          {EXTRA_QIO_MODULE.partNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* 8. Steering Kits */}
          {hasSteeringKits && (
            <Card title="Machine Steering Kit">
              <div className="mb-2">
                <span className="text-xs text-gray-500">Optional Machine Joystick Steering Kit</span>
              </div>
              <div className="space-y-1">
                {steeringPNs.map((pn) => {
                  const spec = getSteeringKitByPN(pn);
                  return (
                    <div
                      key={pn}
                      className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-700">{spec?.name ?? 'Unknown steering kit'}</span>
                      </div>
                      <span className="font-mono text-gray-500 text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {pn}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* 7. Prerequisites */}
          {kit.prerequisites && kit.prerequisites.trim() !== '' && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 mb-1">Prerequisites</h3>
                <p className="text-sm text-amber-700 whitespace-pre-wrap">{kit.prerequisites}</p>
              </div>
            </div>
          )}

          {/* 8. Limitations */}
          {kit.limitations && kit.limitations.trim() !== '' && (
            <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-rose-800 mb-1">Limitations</h3>
                <p className="text-sm text-rose-700 whitespace-pre-wrap">{kit.limitations}</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
