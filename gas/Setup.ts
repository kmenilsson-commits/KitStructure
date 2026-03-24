function setupDatabase(): void {
  const ss = SpreadsheetApp.create('QTC Kit Configurator Database');

  // Remove the default sheet and create the required sheets in order
  const defaultSheet = ss.getSheets()[0];

  const sheetNames = ['Brands', 'Models', 'Kits', 'KitRequests', 'Admins'];
  const sheets: { [name: string]: GoogleAppsScript.Spreadsheet.Sheet } = {};

  // Create sheets in order
  sheetNames.forEach((name, index) => {
    let sheet: GoogleAppsScript.Spreadsheet.Sheet;
    if (index === 0) {
      // Rename the default sheet for the first one
      defaultSheet.setName(name);
      sheet = defaultSheet;
    } else {
      sheet = ss.insertSheet(name);
    }
    sheets[name] = sheet;
  });

  // Write header rows
  sheets['Brands'].getRange(1, 1, 1, 5).setValues([[
    'id', 'name', 'logoFilename', 'active', 'createdAt'
  ]]);

  sheets['Models'].getRange(1, 1, 1, 7).setValues([[
    'id', 'brandId', 'brandName', 'name', 'tonnage', 'machineType', 'createdAt'
  ]]);

  sheets['Kits'].getRange(1, 1, 1, 16).setValues([[
    'id', 'modelId', 'status', 'cableLength', 'leftJoysticks', 'rightJoysticks',
    'needsFeederValves', 'needsExtraQio', 'steeringKits', 'configPartNumber',
    'prerequisites', 'limitations', 'updatedAt', 'updatedBy',
    'cableKitPartNumber', 'cableKitDescription'
  ]]);

  sheets['KitRequests'].getRange(1, 1, 1, 8).setValues([[
    'id', 'brandName', 'modelName', 'requestedBy', 'note', 'status', 'createdAt', 'adminNote'
  ]]);

  sheets['Admins'].getRange(1, 1, 1, 1).setValues([['email']]);

  // Pre-populate known admin users
  const ADMIN_EMAILS = [
    'markus.nilsson@steelwrist.com',
    'peter.andersson@steelwrist.com',
  ];
  if (ADMIN_EMAILS.length > 0) {
    sheets['Admins'].getRange(2, 1, ADMIN_EMAILS.length, 1).setValues(
      ADMIN_EMAILS.map(e => [e])
    );
    Logger.log('Admin users added: ' + ADMIN_EMAILS.join(', '));
  }

  // Save spreadsheet ID to Script Properties
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', ss.getId());

  Logger.log('Spreadsheet created: ' + ss.getUrl());

  // Seed initial brand and model data
  seedBrandsAndModels();

  Logger.log('Setup complete. Spreadsheet URL: ' + ss.getUrl());
}

function seedBrandsAndModels(): void {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID not found in Script Properties. Run setupDatabase() first.');
  }

  const ss = SpreadsheetApp.openById(spreadsheetId);
  const brandsSheet = ss.getSheetByName('Brands');
  const modelsSheet = ss.getSheetByName('Models');

  if (!brandsSheet || !modelsSheet) {
    throw new Error('Brands or Models sheet not found.');
  }

  // Clear existing data rows (keep header)
  const brandsLastRow = brandsSheet.getLastRow();
  if (brandsLastRow > 1) {
    brandsSheet.getRange(2, 1, brandsLastRow - 1, 5).clearContent();
  }
  const modelsLastRow = modelsSheet.getLastRow();
  if (modelsLastRow > 1) {
    modelsSheet.getRange(2, 1, modelsLastRow - 1, 7).clearContent();
  }

  // Build unique brands map preserving first-seen order
  const brandNameToId: { [name: string]: string } = {};
  const brandRows: any[][] = [];
  const now = new Date().toISOString();

  SEED_DATA.forEach((entry) => {
    if (!brandNameToId[entry.brand]) {
      const id = Utilities.getUuid();
      brandNameToId[entry.brand] = id;
      const logoFilename = BRAND_LOGO_MAP[entry.brand] || '';
      brandRows.push([id, entry.brand, logoFilename, true, now]);
    }
  });

  // Write brands in one batch
  if (brandRows.length > 0) {
    brandsSheet.getRange(2, 1, brandRows.length, 5).setValues(brandRows);
  }

  // Build model rows
  const modelRows: any[][] = SEED_DATA.map((entry) => {
    const id = Utilities.getUuid();
    const brandId = brandNameToId[entry.brand];
    return [id, brandId, entry.brand, entry.model, '', '', now];
  });

  // Write models in one batch
  if (modelRows.length > 0) {
    modelsSheet.getRange(2, 1, modelRows.length, 7).setValues(modelRows);
  }

  Logger.log('Seeded ' + brandRows.length + ' brands and ' + modelRows.length + ' models.');
}

function resetDatabase(): void {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) {
    throw new Error('SPREADSHEET_ID not found in Script Properties. Run setupDatabase() first.');
  }

  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheetsToClear = ['Brands', 'Models', 'Kits', 'KitRequests'];

  sheetsToClear.forEach((sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
      }
    }
  });

  Logger.log('Cleared data from all sheets (headers preserved). Re-seeding brands and models...');
  seedBrandsAndModels();
  Logger.log('Database reset complete.');
}

// ─── One-time migration: add cableKit columns to existing Kits sheet ─────────
// Run this ONCE on an existing database to add the new columns.
// Safe to run multiple times — it checks if columns already exist.
function migrateCableKitColumns(): void {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!spreadsheetId) throw new Error('SPREADSHEET_ID not set. Run setupDatabase() first.');

  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getSheetByName('Kits');
  if (!sheet) throw new Error('Kits sheet not found.');

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const hasCol15 = headers[14] === 'cableKitPartNumber';
  const hasCol16 = headers[15] === 'cableKitDescription';

  if (!hasCol15) {
    sheet.getRange(1, 15).setValue('cableKitPartNumber');
    Logger.log('Added column 15: cableKitPartNumber');
  }
  if (!hasCol16) {
    sheet.getRange(1, 16).setValue('cableKitDescription');
    Logger.log('Added column 16: cableKitDescription');
  }
  if (hasCol15 && hasCol16) {
    Logger.log('Migration already applied — no changes needed.');
  } else {
    Logger.log('Migration complete.');
  }
}
