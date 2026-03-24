import type { AdminView } from '../../types';

interface Props {
  currentView: AdminView;
  onNavigate: (view: AdminView) => void;
  newRequestCount: number;
}

interface NavItem {
  view: AdminView;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'kit-list', label: 'Kit Database' },
  { view: 'brand-manager', label: 'Brands & Models' },
  { view: 'request-list', label: 'Kit Requests' },
];

export default function AdminNav({ currentView, onNavigate, newRequestCount }: Props) {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-1 h-12">
        {/* Logo / App name */}
        <div className="flex items-center gap-2 mr-6 shrink-0">
          <span className="text-sw-orange font-bold text-sm tracking-tight">
            QC Kit Admin
          </span>
        </div>

        {/* Nav tabs */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_ITEMS.map(({ view, label }) => {
            const isActive = currentView === view;
            const showBadge = view === 'request-list' && newRequestCount > 0;

            return (
              <button
                key={view}
                onClick={() => onNavigate(view)}
                className={`relative inline-flex items-center gap-2 px-4 h-12 text-sm font-medium transition-colors focus:outline-none ${
                  isActive
                    ? 'text-sw-orange border-b-2 border-sw-orange'
                    : 'text-gray-400 hover:text-gray-200 border-b-2 border-transparent'
                }`}
              >
                {label}
                {showBadge && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold leading-none">
                    {newRequestCount > 99 ? '99+' : newRequestCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
