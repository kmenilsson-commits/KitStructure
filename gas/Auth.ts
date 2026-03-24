// ─── Authentication & authorisation helpers ─────────────────────────────────

function getCurrentUserEmail(): string {
  return Session.getActiveUser().getEmail();
}

function isAdmin(email?: string): boolean {
  const userEmail = email || getCurrentUserEmail();
  if (!userEmail) return false;
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_ADMINS);
    if (!sheet) return false;
    const data = sheet.getDataRange().getValues();
    // Row 0 is header; check from row 1
    for (let i = 1; i < data.length; i++) {
      if ((data[i][ADMIN_COLS.email - 1] || '').toString().trim().toLowerCase() === userEmail.toLowerCase()) {
        return true;
      }
    }
    return false;
  } catch (e) {
    Logger.log('isAdmin error: ' + e);
    return false;
  }
}

function requireAdmin(): void {
  if (!isAdmin()) {
    throw new Error('Access denied: administrator role required.');
  }
}

function checkAuth(): AuthResult {
  const email = getCurrentUserEmail();
  const role = isAdmin(email) ? 'admin' : 'sales';
  return { email, role };
}
