import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import type { Brand, Model } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface Props {
  brand: Brand;
  models: Model[];
  modelKitStatus: Record<string, 'available' | 'coming_soon'>;
  onSelectModel: (model: Model) => void;
  onBack: () => void;
}

function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

const MACHINE_TYPE_CLASSES: Record<string, string> = {
  CEX: 'bg-blue-100 text-blue-700 border border-blue-200',
  MEX: 'bg-violet-100 text-violet-700 border border-violet-200',
  WEX: 'bg-teal-100 text-teal-700 border border-teal-200',
};

export default function ModelList({
  brand,
  models,
  modelKitStatus,
  onSelectModel,
  onBack,
}: Props) {
  const [search, setSearch] = useState('');

  const sorted = [...models].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = sorted.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sw-orange transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to brands
      </button>

      {/* Brand header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg select-none">
          {brandInitials(brand.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
          <p className="text-sm text-gray-500">
            {models.length} model{models.length !== 1 ? 's' : ''} with Quantum Connect kits
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search models…"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">No models match your search.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tonnage</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Kit Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model, i) => {
                const status = modelKitStatus[model.id];
                const isLast = i === filtered.length - 1;
                return (
                  <tr
                    key={model.id}
                    onClick={() => onSelectModel(model)}
                    className={`cursor-pointer hover:bg-orange-50 transition-colors ${
                      !isLast ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{model.name}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {model.tonnage ? `${model.tonnage} t` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {model.machineType ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            MACHINE_TYPE_CLASSES[model.machineType] ??
                            'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {model.machineType}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {status ? (
                        <StatusBadge status={status} />
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
