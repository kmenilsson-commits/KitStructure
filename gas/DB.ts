// ─── Google Sheets database access layer ─────────────────────────────────────

function getSpreadsheet(): GoogleAppsScript.Spreadsheet.Spreadsheet {
  if (!SPREADSHEET_ID) throw new Error('SPREADSHEET_ID not set. Run setupDatabase() first.');
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name: string): GoogleAppsScript.Spreadsheet.Sheet {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function generateId(): string {
  return Utilities.getUuid();
}

// ─── Brands ──────────────────────────────────────────────────────────────────

function getAllBrands(): Brand[] {
  const sheet = getSheet(SHEET_BRANDS);
  const data = sheet.getDataRange().getValues();
  const brands: Brand[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    brands.push({
      id:           row[BRAND_COLS.id - 1].toString(),
      name:         row[BRAND_COLS.name - 1].toString(),
      logoFilename: row[BRAND_COLS.logoFilename - 1].toString(),
      active:       row[BRAND_COLS.active - 1] === true || row[BRAND_COLS.active - 1] === 'TRUE',
      createdAt:    row[BRAND_COLS.createdAt - 1].toString(),
    });
  }
  return brands;
}

function saveBrand(brand: Brand): Brand {
  requireAdmin();
  const sheet = getSheet(SHEET_BRANDS);
  if (brand.id) {
    // Update existing
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === brand.id) {
        sheet.getRange(i + 1, 1, 1, 5).setValues([[
          brand.id, brand.name, brand.logoFilename, brand.active, brand.createdAt
        ]]);
        return brand;
      }
    }
  }
  // Insert new
  brand.id = generateId();
  brand.createdAt = new Date().toISOString();
  sheet.appendRow([brand.id, brand.name, brand.logoFilename, brand.active, brand.createdAt]);
  return brand;
}

function deleteBrand(brandId: string): void {
  requireAdmin();
  const sheet = getSheet(SHEET_BRANDS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === brandId) {
      // Soft delete — set active = false
      sheet.getRange(i + 1, BRAND_COLS.active).setValue(false);
      return;
    }
  }
}

// ─── Models ──────────────────────────────────────────────────────────────────

function getAllModels(): Model[] {
  const sheet = getSheet(SHEET_MODELS);
  const data = sheet.getDataRange().getValues();
  const models: Model[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    models.push({
      id:          row[MODEL_COLS.id - 1].toString(),
      brandId:     row[MODEL_COLS.brandId - 1].toString(),
      brandName:   row[MODEL_COLS.brandName - 1].toString(),
      name:        row[MODEL_COLS.name - 1].toString(),
      tonnage:     row[MODEL_COLS.tonnage - 1].toString(),
      machineType: row[MODEL_COLS.machineType - 1].toString(),
      createdAt:   row[MODEL_COLS.createdAt - 1].toString(),
    });
  }
  return models;
}

function saveModel(model: Model): Model {
  requireAdmin();
  const sheet = getSheet(SHEET_MODELS);
  if (model.id) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === model.id) {
        sheet.getRange(i + 1, 1, 1, 7).setValues([[
          model.id, model.brandId, model.brandName, model.name, model.tonnage, model.machineType, model.createdAt
        ]]);
        return model;
      }
    }
  }
  model.id = generateId();
  model.createdAt = new Date().toISOString();
  sheet.appendRow([model.id, model.brandId, model.brandName, model.name, model.tonnage, model.machineType, model.createdAt]);
  return model;
}

function deleteModel(modelId: string): void {
  requireAdmin();
  const sheet = getSheet(SHEET_MODELS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === modelId) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ─── Kits ─────────────────────────────────────────────────────────────────────

function getAllKits(): Kit[] {
  const sheet = getSheet(SHEET_KITS);
  const data = sheet.getDataRange().getValues();
  const kits: Kit[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    kits.push(rowToKit(row));
  }
  return kits;
}

function getKitByModelId(modelId: string): Kit | null {
  const sheet = getSheet(SHEET_KITS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[KIT_COLS.modelId - 1].toString() === modelId) {
      return rowToKit(row);
    }
  }
  return null;
}

function rowToKit(row: any[]): Kit {
  return {
    id:                   row[KIT_COLS.id - 1].toString(),
    modelId:              row[KIT_COLS.modelId - 1].toString(),
    status:               row[KIT_COLS.status - 1].toString(),
    cableLength:          row[KIT_COLS.cableLength - 1].toString(),
    leftJoysticks:        row[KIT_COLS.leftJoysticks - 1].toString(),
    rightJoysticks:       row[KIT_COLS.rightJoysticks - 1].toString(),
    needsFeederValves:    row[KIT_COLS.needsFeederValves - 1] === true || row[KIT_COLS.needsFeederValves - 1] === 'TRUE',
    needsExtraQio:        row[KIT_COLS.needsExtraQio - 1] === true || row[KIT_COLS.needsExtraQio - 1] === 'TRUE',
    steeringKits:         row[KIT_COLS.steeringKits - 1].toString(),
    configPartNumber:     row[KIT_COLS.configPartNumber - 1].toString(),
    prerequisites:        row[KIT_COLS.prerequisites - 1].toString(),
    limitations:          row[KIT_COLS.limitations - 1].toString(),
    updatedAt:            row[KIT_COLS.updatedAt - 1].toString(),
    updatedBy:            row[KIT_COLS.updatedBy - 1].toString(),
    // Columns 15-16 may be absent in older rows — default to empty string
    cableKitPartNumber:   (row[KIT_COLS.cableKitPartNumber - 1] || '').toString(),
    cableKitDescription:  (row[KIT_COLS.cableKitDescription - 1] || '').toString(),
  };
}

function saveKit(kit: Kit): Kit {
  requireAdmin();
  const sheet = getSheet(SHEET_KITS);
  kit.updatedAt = new Date().toISOString();
  kit.updatedBy = getCurrentUserEmail();
  if (kit.id) {
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === kit.id) {
        sheet.getRange(i + 1, 1, 1, 16).setValues([[
          kit.id, kit.modelId, kit.status, kit.cableLength,
          kit.leftJoysticks, kit.rightJoysticks,
          kit.needsFeederValves, kit.needsExtraQio,
          kit.steeringKits, kit.configPartNumber,
          kit.prerequisites, kit.limitations,
          kit.updatedAt, kit.updatedBy,
          kit.cableKitPartNumber, kit.cableKitDescription
        ]]);
        return kit;
      }
    }
  }
  kit.id = generateId();
  sheet.appendRow([
    kit.id, kit.modelId, kit.status, kit.cableLength,
    kit.leftJoysticks, kit.rightJoysticks,
    kit.needsFeederValves, kit.needsExtraQio,
    kit.steeringKits, kit.configPartNumber,
    kit.prerequisites, kit.limitations,
    kit.updatedAt, kit.updatedBy,
    kit.cableKitPartNumber, kit.cableKitDescription
  ]);
  return kit;
}

function deleteKit(kitId: string): void {
  requireAdmin();
  const sheet = getSheet(SHEET_KITS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === kitId) {
      // Soft delete — set status to hidden
      sheet.getRange(i + 1, KIT_COLS.status).setValue('hidden');
      return;
    }
  }
}

// ─── Kit Requests ─────────────────────────────────────────────────────────────

function getAllKitRequests(): KitRequest[] {
  requireAdmin();
  const sheet = getSheet(SHEET_REQUESTS);
  const data = sheet.getDataRange().getValues();
  const requests: KitRequest[] = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue;
    requests.push({
      id:          row[REQ_COLS.id - 1].toString(),
      brandName:   row[REQ_COLS.brandName - 1].toString(),
      modelName:   row[REQ_COLS.modelName - 1].toString(),
      requestedBy: row[REQ_COLS.requestedBy - 1].toString(),
      note:        row[REQ_COLS.note - 1].toString(),
      status:      row[REQ_COLS.status - 1].toString(),
      createdAt:   row[REQ_COLS.createdAt - 1].toString(),
      adminNote:   row[REQ_COLS.adminNote - 1].toString(),
    });
  }
  return requests;
}

function submitKitRequest(brandName: string, modelName: string, note: string): void {
  const sheet = getSheet(SHEET_REQUESTS);
  const email = getCurrentUserEmail();
  sheet.appendRow([
    generateId(), brandName, modelName, email, note,
    'new', new Date().toISOString(), ''
  ]);
}

function updateKitRequest(id: string, status: string, adminNote: string): void {
  requireAdmin();
  const sheet = getSheet(SHEET_REQUESTS);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id) {
      sheet.getRange(i + 1, REQ_COLS.status).setValue(status);
      sheet.getRange(i + 1, REQ_COLS.adminNote).setValue(adminNote);
      return;
    }
  }
}

// ─── Composite read for Sales view ───────────────────────────────────────────

function getBrandsWithModels() {
  const brands  = getAllBrands().filter(b => b.active);
  const models  = getAllModels();
  const kits    = getAllKits();

  // Build a set of modelIds that have a visible kit
  const visibleModelIds = new Set(
    kits.filter(k => k.status === 'available' || k.status === 'coming_soon')
        .map(k => k.modelId)
  );

  // Filter models that belong to visible kits
  const visibleModels = models.filter(m => visibleModelIds.has(m.id));

  // Filter brands that have at least one visible model
  const brandIdsWithKits = new Set(visibleModels.map(m => m.brandId));
  const visibleBrands = brands.filter(b => brandIdsWithKits.has(b.id));

  return { brands: visibleBrands, models: visibleModels };
}

// ─── Admin composite read ────────────────────────────────────────────────────

function getAdminData() {
  requireAdmin();
  const brands   = getAllBrands();
  const models   = getAllModels();
  const kits     = getAllKits();
  const requests = getAllKitRequests();
  return { brands, models, kits, requests };
}
