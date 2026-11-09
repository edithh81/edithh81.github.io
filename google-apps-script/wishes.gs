/**
 * Wish board backend for /graduation/.
 * Paste into Extensions → Apps Script of a Google Sheet, then deploy as a web app
 * (Execute as: Me, Who has access: Anyone). See README.md next to this file.
 *
 * Sheet columns: time | name | text | color | hidden
 * To hide a wish from the board, type TRUE in its "hidden" cell. To delete, delete the row.
 */

const SHEET = "wishes";
const COLORS = ["yellow", "pink", "blue", "green"];
const MAX_TEXT = 280, MAX_NAME = 40, MAX_ON_BOARD = 300;

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(["time", "name", "text", "color", "hidden"]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// stop a wish like "=HYPERLINK(...)" from being run as a formula in the sheet
function plain_(s) {
  s = String(s || "").replace(/\s+/g, " ").trim();
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

// GET → visible wishes, oldest first
function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter(r => r[2] && String(r[4]).toUpperCase() !== "TRUE")
    .slice(-MAX_ON_BOARD)
    .map(r => ({
      name: String(r[1]).replace(/^'/, ""),
      text: String(r[2]).replace(/^'/, ""),
      color: COLORS.includes(r[3]) ? r[3] : "yellow",
    }));
  return json_({ ok: true, wishes });
}

// POST (body is JSON sent as text/plain) → append one row
function doPost(e) {
  let w;
  try { w = JSON.parse(e.postData.contents); } catch (_) { return json_({ ok: false, error: "bad request" }); }

  if (w.website) return json_({ ok: true });                       // honeypot: a bot filled the hidden field
  const text = String(w.text || "").trim().slice(0, MAX_TEXT);
  const name = String(w.name || "").trim().slice(0, MAX_NAME);
  if (!text) return json_({ ok: false, error: "empty wish" });

  // simple flood guard: at most 30 wishes per minute overall
  const cache = CacheService.getScriptCache();
  const n = Number(cache.get("rate") || 0);
  if (n >= 30) return json_({ ok: false, error: "too many wishes right now, try again in a minute" });
  cache.put("rate", String(n + 1), 60);

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    sheet_().appendRow([new Date(), plain_(name), plain_(text), COLORS.includes(w.color) ? w.color : "yellow", false]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}
