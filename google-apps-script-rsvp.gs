/**
 * Google Apps Script for the RSVP and post-wedding comments forms.
 *
 * Paste this into Apps Script as Code.gs, then deploy it as a Web app:
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SPREADSHEET_ID = "1EroOtAGMYSBknnWWmEX4fXlmn2drCdPdFAmFh5yHJK0";
const SHEET_NAME = "Sheet1";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date(), 
      data.name, 
      data.attendance, 
      data.alcohol, 
      data.wishes
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var rows = sheet.getDataRange().getValues();
    var comments = [];
    
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][2] === "comment_only" || (rows[i][4] && rows[i][4].toString().trim() !== "")) {
        comments.push({
          timestamp: rows[i][0],
          name: rows[i][1],
          wishes: rows[i][4]
        });
      }
    }
    
    comments.reverse();
    
    return ContentService.createTextOutput(JSON.stringify(comments))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({ 'Access-Control-Allow-Origin': '*' });
  }
}
