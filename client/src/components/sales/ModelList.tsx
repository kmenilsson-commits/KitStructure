import { useState } from 'react';
import { ArrowLeft, Search, ChevronRight, Loader2 } from 'lucide-react';
import type { Brand, Model } from '../../types';
import StatusBadge from '../shared/StatusBadge';
import { BrandLogo, getClearbitLogoUrl, getGoogleFaviconUrl, isExplicitLogoUrl } from './BrandGrid';
import { BUNDLED_LOGOS } from '../../data/brandLogos';

interface Props {
  brand: Brand;
  models: Model[];
  modelKitStatus: Record<string, 'available' | 'coming_soon'>;
  loadingModelId: string | null;
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
  loadingModelId,
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
      <div className="flex items-center gap-4 mb-6">
        <BrandLogo
          url={isExplicitLogoUrl(brand.logoFilename) ? brand.logoFilename! : (BUNDLED_LOGOS[brand.name] ?? getClearbitLogoUrl(brand.name))}
          fallbackUrl={getGoogleFaviconUrl(brand.name)}
          name={brand.name}
          initials={brandInitials(brand.name)}
          circleColor="bg-gray-400"
          size={12}
        />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
          <p className="text-sm text-gray-500">
            {models.length} model{models.length !== 1 ? 's' : ''} with Quantum Connect kits
          </p>
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-gray-400 mb-4">
        Click a row to view kit details or request a kit.
      </p>

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
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((model, i) => {
                const status = modelKitStatus[model.id];
                const isLast = i === filtered.length - 1;
                const isLoading = loadingModelId === model.id;
                const isDisabled = loadingModelId !== null && !isLoading;
                return (
                  <tr
                    key={model.id}
                    onClick={() => !loadingModelId && onSelectModel(model)}
                    className={`transition-colors ${!isLast ? 'border-b border-gray-100' : ''} ${
                      isLoading
                        ? 'bg-orange-50'
                        : isDisabled
                        ? 'opacity-50 cursor-default'
                        : 'cursor-pointer hover:bg-orange-50 active:bg-orange-100'
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
                      {isLoading ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-sw-orange font-medium">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Loading…
                        </span>
                      ) : status ? (
                        <StatusBadge status={status} />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-sw-orange font-medium">
                          No kit — tap to request
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {isLoading ? null : (
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-sw-orange" />
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
