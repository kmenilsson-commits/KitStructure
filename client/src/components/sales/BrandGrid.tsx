import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Brand, Model } from '../../types';
import { BUNDLED_LOGOS } from '../../data/brandLogos';

// Known brand → domain mappings for Clearbit logo lookup
const BRAND_DOMAIN_MAP: Record<string, string> = {
  'Airman': 'airman.co.jp',
  'Atlas': 'atlascopco.com',
  'Bobcat': 'bobcat.com',
  'Brokk': 'brokk.com',
  'Carter': 'carterct.com',
  'Case': 'casece.com',
  'CAT': 'cat.com',
  'Caterpillar': 'cat.com',
  'Colmar': 'colmar.it',
  'Coltrax': 'coltrax.fi',
  'Doosan': 'doosan.com',
  'Eurocomach': 'eurocomach.it',
  'Furukawa': 'furukawa.co.jp',
  'Hanix': 'hanix.co.jp',
  'Hidromek': 'hidromek.com.tr',
  'Hitachi': 'hitachi.com',
  'Hitec': 'hitecmarine.no',
  'Huddig': 'huddig.com',
  'Hydrema': 'hydrema.com',
  'Hyundai': 'hyundai.com',
  'IHI': 'ihi.co.jp',
  'JCB': 'jcb.com',
  'John Deere': 'deere.com',
  'Kato': 'kato-works.co.jp',
  'Kobelco': 'kobelco.com',
  'Komatsu': 'komatsu.com',
  'Kubota': 'kubota.com',
  'LiuGong': 'liugong.com',
  'Liebherr': 'liebherr.com',
  'Manitou': 'manitou.com',
  'Mecalac': 'mecalac.com',
  'Menzi Muck': 'menzimuck.com',
  'Mitsubishi': 'mitsubishicorp.com',
  'New Holland': 'newholland.com',
  'Ponsse': 'ponsse.com',
  'Sany': 'sany.com',
  'Samsung': 'samsung.com',
  'Sumitomo': 'sumitomo.com',
  'Takeuchi': 'takeuchi-mfg.co.jp',
  'Terex': 'terex.com',
  'Volvo': 'volvo.com',
  'Wacker Neuson': 'wackerneuson.com',
  'Xcmg': 'xcmg.com',
  'XCMG': 'xcmg.com',
  'Yanmar': 'yanmar.com',
  'Zoomlion': 'zoomlion.com',
};

export function getClearbitLogoUrl(brandName: string): string {
  const domain = BRAND_DOMAIN_MAP[brandName]
    ?? `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  return `https://logo.clearbit.com/${domain}`;
}

export function getGoogleFaviconUrl(brandName: string): string {
  const domain = BRAND_DOMAIN_MAP[brandName]
    ?? `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

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

/** Renders a brand logo image with automatic fallback: Clearbit → Google favicon → initials circle */
function BrandLogo({
  url,
  fallbackUrl,
  name,
  initials,
  circleColor,
  size = 16,
}: {
  url: string;
  fallbackUrl: string;
  name: string;
  initials: string;
  circleColor: string;
  size?: number;
}) {
  const [stage, setStage] = useState<'primary' | 'fallback' | 'initials'>('primary');

  if (stage === 'initials') {
    return (
      <div
        className={`w-${size} h-${size} rounded-full ${circleColor} flex items-center justify-center text-white text-xl font-bold select-none`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`w-${size} h-${size} rounded-full overflow-hidden bg-white border border-gray-100 flex items-center justify-center`}>
      <img
        src={stage === 'primary' ? url : fallbackUrl}
        alt={name}
        className="w-full h-full object-contain p-1.5"
        onError={() => setStage(stage === 'primary' ? 'fallback' : 'initials')}
      />
    </div>
  );
}

export { BrandLogo };

export default function BrandGrid({ brands, models, onSelectBrand }: Props) {
  const [search, setSearch] = useState('');

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

            // Priority: admin-set URL → bundled logo → Clearbit → Google favicon
            const logoUrl = brand.logoFilename?.startsWith('http')
              ? brand.logoFilename
              : (BUNDLED_LOGOS[brand.name] ?? getClearbitLogoUrl(brand.name));
            const faviconUrl = getGoogleFaviconUrl(brand.name);

            return (
              <button
                key={brand.id}
                onClick={() => onSelectBrand(brand)}
                className="group flex flex-col items-center gap-3 p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-sw-orange/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sw-orange"
              >
                {/* Logo / Initials */}
                <BrandLogo
                  url={logoUrl}
                  fallbackUrl={faviconUrl}
                  name={brand.name}
                  initials={initials}
                  circleColor={circleColor}
                />

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
