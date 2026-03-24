import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import type { Brand, Model, Kit } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface Props {
  brands: Brand[];
  models: Model[];
  kits: Kit[];
  onEditKit: (kit: Kit | null, modelId?: string) => void;
  onDeleteKit: (kitId: string) => void;
  onRefresh: () => void;
}

type SortKey = 'brand' | 'model' | 'tonnage' | 'status' | 'updatedAt';
type SortDir = 'asc' | 'desc';

function formatDate(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function KitList({
  brands,
  models,
  kits,
  onEditKit,
  onDeleteKit,
  onRefresh,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const modelById = useMemo(
    () => Object.fromEntries(models.map((m) => [m.id, m])),
    [models]
  );
  const brandById = useMemo(
    () => Object.fromEntries(brands.map((b) => [b.id, b])),
    [brands]
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = kits.map((kit) => {
      const model = modelById[kit.modelId];
      const brand = model ? brandById[model.brandId] : undefined;
      return { kit, model, brand };
    });

    if (filterBrand) {
      result = result.filter((r) => r.brand?.id === filterBrand);
    }
    if (filterStatus) {
      result = result.filter((r) => r.kit.status === filterStatus);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.brand?.name.toLowerCase().includes(q) ||
          r.model?.name.toLowerCase().includes(q) ||
          r.kit.configPartNumber.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'brand':
          cmp = (a.brand?.name ?? '').localeCompare(b.brand?.name ?? '');
          break;
        case 'model':
          cmp = (a.model?.name ?? '').localeCompare(b.model?.name ?? '');
          break;
        case 'tonnage':
          cmp =
            parseFloat(a.model?.tonnage ?? '0') - parseFloat(b.model?.tonnage ?? '0');
          break;
        case 'status':
          cmp = a.kit.status.localeCompare(b.kit.status);
          break;
        case 'updatedAt':
          cmp =
            new Date(a.kit.updatedAt ?? 0).getTime() -
            new Date(b.kit.updatedAt ?? 0).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [kits, filterBrand, filterStatus, search, sortKey, sortDir, modelById, brandById]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-sw-orange" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-sw-orange" />
    );
  };

  const handleDelete = (kitId: string) => {
    if (pendingDelete === kitId) {
      onDeleteKit(kitId);
      setPendingDelete(null);
    } else {
      setPendingDelete(kitId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Kit Database</h2>
          <p className="text-sm text-gray-500 mt-0.5">{kits.length} kit{kits.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEditKit(null)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sw-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Kit
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brand, model, config P/N…"
          className="flex-1 min-w-[180px] px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent"
        />
        <select
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {(
                  [
                    { key: 'brand', label: 'Brand' },
                    { key: 'model', label: 'Model' },
                    { key: 'tonnage', label: 'Tonnage' },
                  ] as { key: SortKey; label: string }[]
                ).map(({ key, label }) => (
                  <th
                    key={key}
                    className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900"
                    onClick={() => toggleSort(key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label} <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => toggleSort('status')}
                >
                  <span className="inline-flex items-center gap-1">
                    Status <SortIcon col="status" />
                  </span>
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Cable</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Config P/N</th>
                <th
                  className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900"
                  onClick={() => toggleSort('updatedAt')}
                >
                  <span className="inline-flex items-center gap-1">
                    Updated <SortIcon col="updatedAt" />
                  </span>
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-12 text-gray-400 text-sm"
                  >
                    No kits match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map(({ kit, model, brand }, i) => {
                  const isLast = i === filtered.length - 1;
                  const isDeletePending = pendingDelete === kit.id;
                  return (
                    <tr
                      key={kit.id}
                      className={`hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {brand?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {model?.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {model?.tonnage ? `${model.tonnage} t` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {model?.machineType ? (
                          <span className="text-xs font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                            {model.machineType}
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={kit.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {kit.cableLength === '10m' ? '10 m' : '15 m'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {kit.configPartNumber || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {formatDate(kit.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => onEditKit(kit)}
                            className="p-1.5 text-gray-400 hover:text-sw-orange hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit kit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(kit.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDeletePending
                                ? 'text-white bg-rose-500 hover:bg-rose-600'
                                : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                            }`}
                            title={isDeletePending ? 'Click again to confirm delete' : 'Delete kit'}
                            onBlur={() => setPendingDelete(null)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">
          Showing {filtered.length} of {kits.length} kit{kits.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
