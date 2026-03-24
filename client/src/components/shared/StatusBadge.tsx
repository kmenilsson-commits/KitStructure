interface Props {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  available:   { label: 'Available',    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
  coming_soon: { label: 'Coming Soon',  classes: 'bg-amber-100  text-amber-800  border border-amber-200'  },
  hidden:      { label: 'Hidden',       classes: 'bg-gray-100   text-gray-500   border border-gray-200'   },
  new:         { label: 'New',          classes: 'bg-blue-100   text-blue-800   border border-blue-200'   },
  acknowledged:{ label: 'Acknowledged', classes: 'bg-indigo-100 text-indigo-800 border border-indigo-200' },
  in_progress: { label: 'In Progress',  classes: 'bg-purple-100 text-purple-800 border border-purple-200' },
  resolved:    { label: 'Resolved',     classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
};

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600 border border-gray-200' };
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-sm font-semibold' : 'px-2 py-0.5 text-xs font-medium';
  return (
    <span className={`inline-flex items-center rounded-full ${sizeClasses} ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
