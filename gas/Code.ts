// ─── Entry point — GAS web app ───────────────────────────────────────────────

function doGet(e: GoogleAppsScript.Events.DoGet): GoogleAppsScript.HTML.HtmlOutput {
  return HtmlService
    .createHtmlOutputFromFile('index')
    .setTitle('Quantum Connect Kit Configurator')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ─── Public API (callable via google.script.run from the client) ──────────────

// Auth
// checkAuth()  — defined in Auth.ts

// Sales view
// getBrandsWithModels()  — defined in DB.ts

function getKit(modelId: string) {
  return getKitByModelId(modelId);
}

// submitKitRequest(brandName, modelName, note)  — defined in DB.ts

// Admin — brands
// getAllBrands()  — defined in DB.ts
// saveBrand(brand)
// deleteBrand(brandId)

// Admin — models
// getAllModels()
// saveModel(model)
// deleteModel(modelId)

// Admin — kits
// getAdminData()  — all brands/models/kits at once
// saveKit(kit)
// deleteKit(kitId)

// Admin — requests
// getAllKitRequests()
// updateKitRequest(id, status, adminNote)
