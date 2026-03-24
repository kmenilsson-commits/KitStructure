import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, RefreshCw } from 'lucide-react';
import type { Brand, Model } from '../../types';
import { BrandLogo, getClearbitLogoUrl, getGoogleFaviconUrl, isExplicitLogoUrl } from '../sales/BrandGrid';
import { BUNDLED_LOGOS } from '../../data/brandLogos';

interface Props {
  brands: Brand[];
  models: Model[];
  onSaveBrand: (brand: Brand) => Promise<void>;
  onDeleteBrand: (brandId: string) => Promise<void>;
  onSaveModel: (model: Model) => Promise<void>;
  onDeleteModel: (modelId: string) => Promise<void>;
  onRefresh: () => void;
}

interface BrandFormState {
  name: string;
  logoFilename: string;
  active: boolean;
}

interface ModelFormState {
  name: string;
  tonnage: string;
  machineType: Model['machineType'];
}

const EMPTY_BRAND_FORM: BrandFormState = { name: '', logoFilename: '', active: true };
const EMPTY_MODEL_FORM: ModelFormState = { name: '', tonnage: '', machineType: '' };

function newId(): string {
  return `_new_${Date.now()}`;
}

export default function BrandManager({
  brands,
  models,
  onSaveBrand,
  onDeleteBrand,
  onSaveModel,
  onDeleteModel,
  onRefresh,
}: Props) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(
    brands[0]?.id ?? null
  );

  // Brand editing
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState<BrandFormState>(EMPTY_BRAND_FORM);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandDeletePending, setBrandDeletePending] = useState<string | null>(null);

  // Model editing
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelForm, setModelForm] = useState<ModelFormState>(EMPTY_MODEL_FORM);
  const [modelSaving, setModelSaving] = useState(false);
  const [modelDeletePending, setModelDeletePending] = useState<string | null>(null);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) ?? null;
  const brandModels = models
    .filter((m) => m.brandId === selectedBrandId)
    .sort((a, b) => a.name.localeCompare(b.name));

  // ─── Brand handlers ───────────────────────────────────────────────────────

  const startAddBrand = () => {
    setEditingBrandId('__new__');
    setBrandForm(EMPTY_BRAND_FORM);
  };

  const startEditBrand = (brand: Brand) => {
    setSelectedBrandId(brand.id);
    setEditingBrandId(brand.id);
    setBrandForm({
      name: brand.name,
      logoFilename: brand.logoFilename,
      active: brand.active,
    });
  };

  const cancelBrandEdit = () => {
    setEditingBrandId(null);
    setBrandForm(EMPTY_BRAND_FORM);
  };

  const saveBrand = async () => {
    if (!brandForm.name.trim()) return;
    setBrandSaving(true);
    const isNew = editingBrandId === '__new__';
    const existing = isNew ? null : brands.find((b) => b.id === editingBrandId);
    const brand: Brand = {
      id: isNew ? newId() : editingBrandId!,
      name: brandForm.name.trim(),
      logoFilename: brandForm.logoFilename.trim(),
      active: brandForm.active,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    try {
      await onSaveBrand(brand);
      setEditingBrandId(null);
      setBrandForm(EMPTY_BRAND_FORM);
      if (isNew) setSelectedBrandId(brand.id);
    } finally {
      setBrandSaving(false);
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (brandDeletePending === brandId) {
      await onDeleteBrand(brandId);
      setBrandDeletePending(null);
      if (selectedBrandId === brandId) setSelectedBrandId(brands[0]?.id ?? null);
    } else {
      setBrandDeletePending(brandId);
    }
  };

  // ─── Model handlers ───────────────────────────────────────────────────────

  const startAddModel = () => {
    setEditingModelId('__new__');
    setModelForm(EMPTY_MODEL_FORM);
  };

  const startEditModel = (model: Model) => {
    setEditingModelId(model.id);
    setModelForm({
      name: model.name,
      tonnage: model.tonnage,
      machineType: model.machineType,
    });
  };

  const cancelModelEdit = () => {
    setEditingModelId(null);
    setModelForm(EMPTY_MODEL_FORM);
  };

  const saveModel = async () => {
    if (!modelForm.name.trim() || !selectedBrandId) return;
    setModelSaving(true);
    const isNew = editingModelId === '__new__';
    const existing = isNew ? null : models.find((m) => m.id === editingModelId);
    const model: Model = {
      id: isNew ? newId() : editingModelId!,
      brandId: selectedBrandId,
      brandName: selectedBrand?.name ?? '',
      name: modelForm.name.trim(),
      tonnage: modelForm.tonnage.trim(),
      machineType: modelForm.machineType,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
    try {
      await onSaveModel(model);
      setEditingModelId(null);
      setModelForm(EMPTY_MODEL_FORM);
    } finally {
      setModelSaving(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    if (modelDeletePending === modelId) {
      await onDeleteModel(modelId);
      setModelDeletePending(null);
    } else {
      setModelDeletePending(modelId);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-900">Brands &amp; Models</h2>
        <button
          onClick={onRefresh}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left panel: Brands ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">Brands</h3>
            <button
              onClick={startAddBrand}
              className="inline-flex items-center gap-1 text-xs text-sw-orange hover:text-orange-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Brand
            </button>
          </div>

          {/* Add / Edit brand form */}
          {editingBrandId && (
            <div className="px-4 py-4 border-b border-gray-100 bg-orange-50/40">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {editingBrandId === '__new__' ? 'New Brand' : 'Edit Brand'}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Volvo"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Logo URL <span className="font-normal text-gray-400">— or drop an image file</span>
                  </label>
                  <div
                    className="relative"
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-sw-orange'); }}
                    onDragLeave={(e) => { e.currentTarget.classList.remove('ring-2', 'ring-sw-orange'); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('ring-2', 'ring-sw-orange');
                      const file = e.dataTransfer.files[0];
                      if (!file || !file.type.startsWith('image/')) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const result = ev.target?.result;
                        if (typeof result === 'string') setBrandForm((f) => ({ ...f, logoFilename: result }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  >
                    <input
                      type="text"
                      value={brandForm.logoFilename}
                      onChange={(e) => setBrandForm((f) => ({ ...f, logoFilename: e.target.value }))}
                      placeholder="https://… or drop an image here"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange"
                    />
                  </div>
                  {isExplicitLogoUrl(brandForm.logoFilename) && (
                    <img
                      src={brandForm.logoFilename}
                      alt="Logo preview"
                      className="mt-2 h-10 object-contain rounded border border-gray-100 bg-white p-1"
                    />
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={brandForm.active}
                    onChange={(e) => setBrandForm((f) => ({ ...f, active: e.target.checked }))}
                    className="w-4 h-4 accent-sw-orange"
                  />
                  <span className="text-gray-700">Active (visible to sales)</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={saveBrand}
                    disabled={brandSaving || !brandForm.name.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sw-orange text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {brandSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelBrandEdit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Brand list */}
          <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {brands.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-gray-400">No brands yet.</li>
            )}
            {brands.map((brand) => {
              const isSelected = brand.id === selectedBrandId;
              const isDeletePending = brandDeletePending === brand.id;
              return (
                <li
                  key={brand.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-orange-50 border-l-2 border-sw-orange' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedBrandId(brand.id)}
                >
                  {/* Active dot */}
                  {/* Logo thumbnail */}
                  <div className="w-8 h-8 shrink-0">
                    <BrandLogo
                      url={isExplicitLogoUrl(brand.logoFilename) ? brand.logoFilename! : (BUNDLED_LOGOS[brand.name] ?? getClearbitLogoUrl(brand.name))}
                      fallbackUrl={getGoogleFaviconUrl(brand.name)}
                      name={brand.name}
                      initials={brand.name.slice(0, 2).toUpperCase()}
                      circleColor="bg-gray-300"
                      size={8}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800 truncate">{brand.name}</p>
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          brand.active ? 'bg-emerald-400' : 'bg-gray-300'
                        }`}
                        title={brand.active ? 'Active' : 'Inactive'}
                      />
                    </div>
                    {brand.logoFilename && (
                      <p className="text-xs text-gray-400 truncate">{brand.logoFilename}</p>
                    )}
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => startEditBrand(brand)}
                      className="p-1.5 text-gray-400 hover:text-sw-orange hover:bg-orange-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBrand(brand.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isDeletePending
                          ? 'text-white bg-rose-500 hover:bg-rose-600'
                          : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                      title={isDeletePending ? 'Click again to confirm' : 'Delete brand'}
                      onBlur={() => setBrandDeletePending(null)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Right panel: Models ── */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-200px)]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              {selectedBrand ? `Models — ${selectedBrand.name}` : 'Models'}
            </h3>
            {selectedBrand && (
              <button
                onClick={startAddModel}
                className="inline-flex items-center gap-1 text-xs text-sw-orange hover:text-orange-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Model
              </button>
            )}
          </div>

          {/* Add / Edit model form */}
          {editingModelId && selectedBrand && (
            <div className="px-4 py-4 border-b border-gray-100 bg-orange-50/40">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                {editingModelId === '__new__' ? 'New Model' : 'Edit Model'}
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => setModelForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. EC220E"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tonnage
                    </label>
                    <input
                      type="text"
                      value={modelForm.tonnage}
                      onChange={(e) =>
                        setModelForm((f) => ({ ...f, tonnage: e.target.value }))
                      }
                      placeholder="22"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Machine Type
                    </label>
                    <select
                      value={modelForm.machineType}
                      onChange={(e) =>
                        setModelForm((f) => ({
                          ...f,
                          machineType: e.target.value as Model['machineType'],
                        }))
                      }
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sw-orange bg-white"
                    >
                      <option value="">—</option>
                      <option value="CEX">CEX</option>
                      <option value="MEX">MEX</option>
                      <option value="WEX">WEX</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveModel}
                    disabled={modelSaving || !modelForm.name.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sw-orange text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {modelSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={cancelModelEdit}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Model list */}
          {!selectedBrand ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              Select a brand to view its models.
            </div>
          ) : brandModels.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No models for this brand yet.
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {brandModels.map((model) => {
                const isDeletePending = modelDeletePending === model.id;
                return (
                  <li
                    key={model.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {model.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {model.tonnage && (
                          <span className="text-xs text-gray-400">{model.tonnage} t</span>
                        )}
                        {model.machineType && (
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                            {model.machineType}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEditModel(model)}
                        className="p-1.5 text-gray-400 hover:text-sw-orange hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteModel(model.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDeletePending
                            ? 'text-white bg-rose-500 hover:bg-rose-600'
                            : 'text-gray-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                        title={isDeletePending ? 'Click again to confirm' : 'Delete model'}
                        onBlur={() => setModelDeletePending(null)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
