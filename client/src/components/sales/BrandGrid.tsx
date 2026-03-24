import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Brand, Model } from '../../types';

interface Props {
  brands: Brand[];
  models: Model[];
  onSelectBrand: (brand: Brand) => void;
}

function brandInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// Deterministic hue based on brand name for the initials circle
function brandColor(name: string): string {
  const colors = [
    'bg-blue-600',
    'bg-violet-600',
    'bg-emerald-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-cyan-600',
    'bg-indigo-600',
    'bg-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return colors[hash % colors.length];
}

export default function BrandGrid({ brands, models, onSelectBrand }: Props) {
  const [search, setSearch] = useState('');

  const activeModels = models.filter((m) => {
    // A brand is relevant if it has at least one model
    return true;
  });

  const modelCountByBrand: Record<string, number> = {};
  for (const m of models) {
    modelCountByBrand[m.brandId] = (modelCountByBrand[m.brandId] ?? 0) + 1;
  }

  const filtered = brands
    .filter((b) => b.active)
    .filter((b) => b.name.toLowerCase().includes(search.toLowerCase().trim()));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Select Brand</h1>
        <p className="mt-1 text-gray-500 text-sm">
          Choose an excavator brand to see available Quantum Connect kits
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands…"
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-16 text-sm">No brands match your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((brand) => {
            const count = modelCountByBrand[brand.id] ?? 0;
            const initials = brandInitials(brand.name);
            const circleColor = brandColor(brand.name);

            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand)}
                className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-sw-orange/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sw-orange"
              >
                {/* Logo / Initials */}
                <div
                  className={`w-16 h-16 rounded-full ${circleColor} flex items-center justify-center text-white text-xl font-bold select-none`}
                >
                  {initials}
                </div>

                {/* Brand name */}
                <span className="text-sm font-semibold text-gray-800 group-hover:text-sw-orange transition-colors text-center leading-tight">
                  {brand.name}
                </span>

                {/* Model count */}
                <span className="text-xs text-gray-400">
                  {count === 0
                    ? 'No models yet'
                    : `${count} model${count !== 1 ? 's' : ''}`}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
