import { useEffect, useState, useCallback } from 'react'
import type { AuthResult, Brand, BrandsWithModels, Model, Kit, AdminData, AdminView } from './types'
import { api } from './gasApi'
import LoadingSpinner from './components/shared/LoadingSpinner'
import BrandGrid from './components/sales/BrandGrid'
import ModelList from './components/sales/ModelList'
import KitDetail from './components/sales/KitDetail'
import KitRequestModal from './components/sales/KitRequestModal'
import AdminNav from './components/admin/AdminNav'
import KitList from './components/admin/KitList'
import KitEditor from './components/admin/KitEditor'
import BrandManager from './components/admin/BrandManager'
import RequestList from './components/admin/RequestList'

const APP_VERSION = 'V1.7'

type SalesScreen =
  | { screen: 'brand-grid' }
  | { screen: 'model-list'; brand: Brand }
  | { screen: 'kit-detail'; brand: Brand; model: Model; kit: Kit | null }

export default function App() {
  const [auth, setAuth] = useState<AuthResult | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  // Sales state
  const [salesNav, setSalesNav] = useState<SalesScreen>({ screen: 'brand-grid' })
  const [salesData, setSalesData] = useState<BrandsWithModels | null>(null)
  const [salesLoading, setSalesLoading] = useState(false)
  const [loadingModelId, setLoadingModelId] = useState<string | null>(null)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestModalTarget, setRequestModalTarget] = useState<{ brand: Brand; model: Model } | null>(null)

  // Admin state
  const [adminView, setAdminView] = useState<AdminView>('kit-list')
  const [adminData, setAdminData] = useState<AdminData | null>(null)
  const [adminLoading, setAdminLoading] = useState(false)
  const [editingKit, setEditingKit] = useState<Kit | null | undefined>(undefined)

  // Admin preview mode — lets admins see the sales UI
  const [previewMode, setPreviewMode] = useState(false)

  // ─── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    api.checkAuth()
      .then(setAuth)
      .catch(err => setAuthError(err.message))
  }, [])

  // ─── Sales data ─────────────────────────────────────────────────────────
  const loadSalesData = useCallback(() => {
    setSalesLoading(true)
    api.getBrandsWithModels()
      .then(data => { setSalesData(data); setSalesLoading(false) })
      .catch(() => setSalesLoading(false))
  }, [])

  // Load for sales users OR when admin enters preview mode
  useEffect(() => {
    if (!auth) return
    if (auth.role === 'sales' || (auth.role === 'admin' && previewMode && !salesData)) {
      loadSalesData()
    }
  }, [auth, previewMode, salesData, loadSalesData])

  // ─── Admin data ──────────────────────────────────────────────────────────
  const loadAdminData = useCallback(() => {
    if (!auth || auth.role !== 'admin') return
    setAdminLoading(true)
    api.getAdminData()
      .then(data => { setAdminData(data); setAdminLoading(false) })
      .catch(() => setAdminLoading(false))
  }, [auth])

  useEffect(() => {
    if (auth?.role === 'admin') loadAdminData()
  }, [auth, loadAdminData])

  // ─── Sales actions ───────────────────────────────────────────────────────
  const handleSelectBrand = (brand: Brand) => setSalesNav({ screen: 'model-list', brand })

  const handleSelectModel = async (brand: Brand, model: Model) => {
    setLoadingModelId(model.id)
    try {
      const kit = await api.getKit(model.id)
      setSalesNav({ screen: 'kit-detail', brand, model, kit })
    } finally {
      setLoadingModelId(null)
    }
  }

  const handleOpenRequestModal = (brand: Brand, model: Model) => {
    setRequestModalTarget({ brand, model })
    setRequestModalOpen(true)
  }

  const handleSubmitRequest = async (note: string) => {
    if (!requestModalTarget) return
    await api.submitKitRequest(requestModalTarget.brand.name, requestModalTarget.model.name, note)
  }

  // ─── Admin actions ───────────────────────────────────────────────────────
  const handleSaveKit    = async (kit: Kit)    => { await api.saveKit(kit);         setEditingKit(undefined); loadAdminData() }
  const handleDeleteKit  = async (id: string)  => { await api.deleteKit(id);        loadAdminData() }
  const handleSaveBrand  = async (b: Brand)    => { await api.saveBrand(b);         loadAdminData() }
  const handleDeleteBrand= async (id: string)  => { await api.deleteBrand(id);      loadAdminData() }
  const handleSaveModel  = async (m: Model)    => { await api.saveModel(m);         loadAdminData() }
  const handleDeleteModel= async (id: string)  => { await api.deleteModel(id);      loadAdminData() }
  const handleUpdateRequest = async (id: string, status: string, note: string) => {
    await api.updateKitRequest(id, status, note); loadAdminData()
  }

  // ─── Kit status map (for ModelList) ─────────────────────────────────────
  // Comes from salesData so it works for both sales users and admin preview mode.
  const modelKitStatus = salesData?.kitStatusByModelId ?? {}

  // ─── Loading / error gates ───────────────────────────────────────────────
  if (!auth && !authError) return <LoadingSpinner message="Connecting to Google…" />
  if (authError) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="card p-8 max-w-sm text-center">
        <p className="text-red-600 font-semibold">Authentication error</p>
        <p className="text-sm text-gray-500 mt-2">{authError}</p>
      </div>
    </div>
  )

  // ─── Shared Header ───────────────────────────────────────────────────────
  const isAdmin = auth?.role === 'admin'
  const showingSalesView = !isAdmin || previewMode

  const Header = () => (
    <header className="bg-sw-dark text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          {/* Steelwrist wordmark */}
          <svg viewBox="0 0 120 24" className="h-6 w-auto" aria-label="Steelwrist" fill="currentColor">
            <text y="20" fontSize="20" fontWeight="700" fontFamily="system-ui,sans-serif" letterSpacing="-0.5">steelwrist</text>
          </svg>
          <span className="text-white/30 text-lg font-light hidden sm:block">|</span>
          <span className="font-semibold text-sm hidden sm:block">QTC Kit Configurator</span>
          <span className="font-semibold text-sm sm:hidden">QTC Kits</span>
          <span className="text-xs text-white/40 font-mono hidden sm:block">{APP_VERSION}</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAdmin && !previewMode && (
            <button
              onClick={() => { setPreviewMode(true); setSalesNav({ screen: 'brand-grid' }) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
              title="Switch to sales user view"
            >
              <span>👁</span>
              <span className="hidden sm:inline">Preview as Sales User</span>
              <span className="sm:hidden">Preview</span>
            </button>
          )}
          {isAdmin && previewMode && (
            <button
              onClick={() => setPreviewMode(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sw-orange hover:bg-orange-600 text-white text-xs font-medium transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:inline">Back to Admin</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
          <span className="text-xs text-gray-400 hidden sm:block">{auth?.email}</span>
          {isAdmin && (
            <span className="bg-sw-orange/20 text-orange-300 border border-orange-500/30 text-xs px-2 py-0.5 rounded-full font-semibold">
              Admin
            </span>
          )}
        </div>
      </div>

      {/* Preview mode banner */}
      {isAdmin && previewMode && (
        <div className="bg-amber-400 text-amber-900 text-xs font-semibold text-center py-1 px-4">
          👁 Preview Mode — you are seeing the app as a sales user
        </div>
      )}
    </header>
  )

  // ─── Sales / preview view ─────────────────────────────────────────────────
  const SalesView = () => (
    <>
      {salesLoading && <LoadingSpinner message="Loading kit data…" />}
      {!salesLoading && salesData && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {salesNav.screen === 'brand-grid' && (
            <BrandGrid
              brands={salesData.brands}
              models={salesData.models}
              onSelectBrand={handleSelectBrand}
            />
          )}
          {salesNav.screen === 'model-list' && (
            <ModelList
              brand={salesNav.brand}
              models={salesData.models.filter(m => m.brandId === salesNav.brand.id)}
              modelKitStatus={modelKitStatus}
              loadingModelId={loadingModelId}
              onSelectModel={model => handleSelectModel(salesNav.brand, model)}
              onBack={() => setSalesNav({ screen: 'brand-grid' })}
            />
          )}
          {salesNav.screen === 'kit-detail' && (
            <>
              <KitDetail
                brand={salesNav.brand}
                model={salesNav.model}
                kit={salesNav.kit}
                onBack={() => setSalesNav({ screen: 'model-list', brand: salesNav.brand })}
                onRequestKit={() => handleOpenRequestModal(salesNav.brand, salesNav.model)}
              />
              {requestModalOpen && requestModalTarget && (
                <KitRequestModal
                  brand={requestModalTarget.brand}
                  model={requestModalTarget.model}
                  onSubmit={handleSubmitRequest}
                  onClose={() => { setRequestModalOpen(false); setRequestModalTarget(null) }}
                />
              )}
            </>
          )}
        </div>
      )}
    </>
  )

  // ─── Admin view ───────────────────────────────────────────────────────────
  if (isAdmin && !previewMode) {
    const newRequestCount = adminData?.requests?.filter(r => r.status === 'new').length ?? 0
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AdminNav
          currentView={adminView}
          onNavigate={view => { setAdminView(view); setEditingKit(undefined) }}
          newRequestCount={newRequestCount}
        />
        {adminLoading && <LoadingSpinner message="Loading admin data…" />}
        {!adminLoading && adminData && editingKit !== undefined && (
          <div className="max-w-4xl mx-auto px-4 py-6">
            <KitEditor
              kit={editingKit}
              brands={adminData.brands}
              models={adminData.models}
              onSave={handleSaveKit}
              onCancel={() => setEditingKit(undefined)}
            />
          </div>
        )}
        {!adminLoading && adminData && editingKit === undefined && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            {adminView === 'kit-list'      && <KitList brands={adminData.brands} models={adminData.models} kits={adminData.kits} onEditKit={kit => setEditingKit(kit)} onDeleteKit={handleDeleteKit} onRefresh={loadAdminData} />}
            {adminView === 'brand-manager' && <BrandManager brands={adminData.brands} models={adminData.models} onSaveBrand={handleSaveBrand} onDeleteBrand={handleDeleteBrand} onSaveModel={handleSaveModel} onDeleteModel={handleDeleteModel} onRefresh={loadAdminData} />}
            {adminView === 'request-list'  && <RequestList requests={adminData.requests ?? []} onUpdateRequest={handleUpdateRequest} onRefresh={loadAdminData} />}
          </div>
        )}
      </div>
    )
  }

  // ─── Sales user view (or admin in preview mode) ───────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <SalesView />
    </div>
  )
}
