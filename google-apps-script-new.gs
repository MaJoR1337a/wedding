/**
 * Google Apps Script for RSVP and Post-Wedding Comments
 * Uses two separate sheets: Sheet1 (RSVP) and Comments (Post-Wedding)
 *
 * Deploy as Web app: Execute as Me | Who has access: Anyone
 */

const SPREADSHEET_ID = "1EroOtAGMYSBknnWWmEX4fXlmn2drCdPdFAmFh5yHJK0";
const RSVP_SHEET = "Sheet1";
const COMMENTS_SHEET = "Comments";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (jsonError) {
      data = e.parameter || {};
    }

    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Якщо це коментар (attendance = "comment_only")
    if (data.attendance === "comment_only") {
      var commentsSheet = getOrCreateSheet_(spreadsheet, COMMENTS_SHEET);
      commentsSheet.appendRow([
        new Date(),
        data.name,
        data.wishes
      ]);
    } else {
      // Інакше це RSVP
      var rsvpSheet = spreadsheet.getSheetByName(RSVP_SHEET);
      if (!rsvpSheet) throw new Error("RSVP Sheet not found: " + RSVP_SHEET);
      
      rsvpSheet.appendRow([
        new Date(),
        data.name,
        data.attendance,
        data.alcohol,
        data.wishes
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    var commentsSheet = getOrCreateSheet_(spreadsheet, COMMENTS_SHEET);
    var rows = commentsSheet.getDataRange().getValues();
    var comments = [];
    
    // Пропускаємо заголовок
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] && rows[i][1] && rows[i][2]) {
        comments.push({
          timestamp: rows[i][0].toISOString ? rows[i][0].toISOString() : rows[i][0].toString(),
          name: String(rows[i][1]).trim(),
          wishes: String(rows[i][2]).trim()
        });
      }
    }
    
    // Нові коментарі спочатку
    comments.reverse();
    
    return ContentService.createTextOutput(JSON.stringify(comments))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify([]))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Додаємо заголовки
    if (sheetName === COMMENTS_SHEET) {
      sheet.appendRow(["Timestamp", "Name", "Wishes"]);
    }
  }
  
  return sheet;
}
