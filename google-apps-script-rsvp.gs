/**
 * Google Apps Script for the RSVP and post-wedding comments forms.
 *
 * Paste this into Apps Script as Code.gs, then deploy it as a Web app:
 * - Execute as: Me
 * - Who has access: Anyone
 */

const SPREADSHEET_ID = "1EroOtAGMYSBknnWWmEX4fXlmn2drCdPdFAmFh5yHJK0";
const SHEET_NAME = "Sheet12";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = getSheet_();
    var data = {};
    try {
      data = JSON.parse(e.postData.contents);
    } catch (jsonError) {
      data = e.parameter || {};
    }
    
    // Порядок: Дата, Ім'я, Присутність, Алкоголь, Інший алкоголь, Побажання
    sheet.appendRow([
      new Date(),                      // Дата
      data.name, 
      data.attendance, 
      data.alcohol,                    // Алкоголь
      "",                              // Інший алкоголь (для майбутнього використання)
      data.wishes                      // Побажання
    ]);
    
    // Форматувати дату в колонці "Дата"
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1).setNumberFormat("yyyy-MM-dd HH:mm:ss");
    sheet.getRange(lastRow, 3).setHorizontalAlignment("center");

    
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  try {
    var sheet = getSheet_();
    var rows = sheet.getDataRange().getValues();
    var comments = [];
    
    for (var i = 1; i < rows.length; i++) {
      // Структура: [Дата, Ім'я, Присутність, Алкоголь, Інший алкоголь, Побажання]
      // Індекси: 0, 1, 2, 3, 4, 5
      if (rows[i][2] === "comment_only" || (rows[i][5] && rows[i][5].toString().trim() !== "")) {
        comments.push({
          timestamp: rows[i][0],
          name: rows[i][1],
          wishes: rows[i][5]
        });
      }
    }
    
    comments.reverse();
    
    return ContentService.createTextOutput(JSON.stringify(comments))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet_() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    
    // Заголовки: Дата, Ім'я, Присутність, Алкоголь, Інший алкоголь, Побажання
    var headerRow = ["Дата", "Ім'я", "Присутність", "Алкоголь", "Інший алкоголь", "Побажання"];
    sheet.appendRow(headerRow);
    
    // Форматування заголовків
    var headerRange = sheet.getRange(1, 1, 1, headerRow.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#9d806e");  // Almond color
    headerRange.setFontColor("#ffffff");   // Білий текст
    headerRange.setHorizontalAlignment("center");
    headerRange.setVerticalAlignment("middle");
    
    // Заморозити перший рядок
    sheet.setFrozenRows(1);
    
    // Встановити ширину колонок
    sheet.setColumnWidth(1, 150);  // Дата
    sheet.setColumnWidth(2, 200);  // Ім'я
    sheet.setColumnWidth(3, 120);  // Присутність
    sheet.setColumnWidth(4, 150);  // Алкоголь
    sheet.setColumnWidth(5, 150);  // Інший алкоголь
    sheet.setColumnWidth(6, 250);  // Побажання
    
    // Додати автоматичний фільтр
    sheet.getRange(1, 1, 1, headerRow.length).createFilter();
  }
  return sheet;
}

