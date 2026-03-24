import { useState } from 'react';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import type { Brand, Model } from '../../types';

interface Props {
  brand: Brand;
  model: Model;
  onSubmit: (note: string) => Promise<void>;
  onClose: () => void;
}

export default function KitRequestModal({ brand, model, onSubmit, onClose }: Props) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await onSubmit(note);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Dark overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request Quantum Connect Kit</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {brand.name} — {model.name}
              {model.tonnage ? ` (${model.tonnage} t)` : ''}
            </p>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {success ? (
            /* Success state */
            <div className="flex flex-col items-center py-6 gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Request submitted!</p>
                <p className="text-sm text-gray-500 mt-1">
                  Our engineering team will review it and get back to you.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-5">
                <label
                  htmlFor="kit-request-note"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Note{' '}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  id="kit-request-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Add context: customer name, urgency, use case…"
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-sw-orange focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              {error && (
                <div className="mb-4 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-sw-orange text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
