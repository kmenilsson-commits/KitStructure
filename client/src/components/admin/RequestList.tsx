import { useState, useMemo } from 'react';
import { RefreshCw, Loader2, PlusCircle } from 'lucide-react';
import type { KitRequest } from '../../types';
import StatusBadge from '../shared/StatusBadge';

interface Props {
  requests: KitRequest[];
  onUpdateRequest: (id: string, status: string, adminNote: string) => Promise<void>;
  onCreateKit: (req: KitRequest) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS: { value: KitRequest['status']; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
];

interface RowState {
  status: KitRequest['status'];
  adminNote: string;
  saving: boolean;
  saved: boolean;
}

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

export default function RequestList({ requests, onUpdateRequest, onCreateKit, onRefresh }: Props) {
  const [filterStatus, setFilterStatus] = useState('');
  const [rowStates, setRowStates] = useState<Record<string, RowState>>({});

  const getRowState = (req: KitRequest): RowState =>
    rowStates[req.id] ?? {
      status: req.status,
      adminNote: req.adminNote ?? '',
      saving: false,
      saved: false,
    };

  const setRowField = <K extends keyof RowState>(
    id: string,
    field: K,
    value: RowState[K],
    req: KitRequest
  ) => {
    setRowStates((prev) => ({
      ...prev,
      [id]: { ...getRowState(req), ...prev[id], [field]: value, saved: false },
    }));
  };

  const isDirty = (req: KitRequest): boolean => {
    const s = rowStates[req.id];
    if (!s) return false;
    return s.status !== req.status || s.adminNote !== (req.adminNote ?? '');
  };

  const handleSave = async (req: KitRequest) => {
    const state = getRowState(req);
    setRowStates((prev) => ({
      ...prev,
      [req.id]: { ...state, saving: true },
    }));
    try {
      await onUpdateRequest(req.id, state.status, state.adminNote);
      setRowStates((prev) => ({
        ...prev,
        [req.id]: { ...state, saving: false, saved: true },
      }));
    } catch {
      setRowStates((prev) => ({
        ...prev,
        [req.id]: { ...state, saving: false },
      }));
    }
  };

  const newCount = requests.filter((r) => r.status === 'new').length;

  const sorted = useMemo(
    () =>
      [...requests].sort(
        (a, b) =>
          new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
      ),
    [requests]
  );

  const filtered = filterStatus
    ? sorted.filter((r) => r.status === filterStatus)
    : sorted;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900">Kit Requests</h2>
          {newCount > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
              {newCount} new
            </span>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Model</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Requested By</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[180px]">
                  Note
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[140px]">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 min-w-[200px]">
                  Admin Note
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((req, i) => {
                  const state = getRowState(req);
                  const dirty = isDirty(req);
                  const isLast = i === filtered.length - 1;

                  return (
                    <tr
                      key={req.id}
                      className={`align-top ${!isLast ? 'border-b border-gray-100' : ''} ${
                        req.status === 'new' ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">
                        {req.brandName}
                      </td>
                      <td className="px-4 py-3 text-gray-900 whitespace-nowrap">
                        {req.modelName}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {req.requestedBy}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(req.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[220px]">
                        <span className="block whitespace-pre-wrap break-words">
                          {req.note || <em className="text-gray-300">—</em>}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={state.status}
                          onChange={(e) =>
                            setRowField(req.id, 'status', e.target.value as KitRequest['status'], req)
                          }
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-1.5">
                          <StatusBadge status={state.status} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <textarea
                          value={state.adminNote}
                          onChange={(e) =>
                            setRowField(req.id, 'adminNote', e.target.value, req)
                          }
                          rows={2}
                          placeholder="Add admin note…"
                          className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs resize-none focus:outline-none focus:ring-2 focus:ring-sw-orange"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <button
                            onClick={() => onCreateKit(req)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition-colors"
                            title="Open New Kit editor pre-filled for this model"
                          >
                            <PlusCircle className="w-3 h-3" />
                            Create Kit
                          </button>
                          {dirty && (
                            <button
                              onClick={() => handleSave(req)}
                              disabled={state.saving}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sw-orange text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
                            >
                              {state.saving ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Saving…
                                </>
                              ) : (
                                'Save'
                              )}
                            </button>
                          )}
                          {state.saved && !dirty && (
                            <span className="text-xs text-emerald-600 font-medium">Saved</span>
                          )}
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
    </div>
  );
}
