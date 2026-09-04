
// apps-script.js - مربوط باللينك الجديد
// URL: https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec
// Sheet ID: 12KpLcWLt7Xzb09A6D8qErKOvEhZvqX9-AUTn5052RdQ

const SHEET_NAME = 'App-Omar-Backup';
const SHEET_ID = '12KpLcWLt7Xzb09A6D8qErKOvEhZvqX9-AUTn5052RdQ';

function doPost(e) {
  try {
    let data = JSON.parse(e.postData.contents);
    let ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    
    let jsonStr = JSON.stringify(data.data);
    sheet.clear();
    sheet.getRange(1,1).setValue(jsonStr);
    sheet.getRange(1,2).setValue(new Date().toISOString());
    sheet.getRange(1,3).setValue('Backup');
    
    return ContentService.createTextOutput(JSON.stringify({status:'ok', saved: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    let action = e.parameter.action;
    let ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({tx: [], error: 'no backup'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let jsonStr = sheet.getRange(1,1).getValue();
    if (!jsonStr) {
      return ContentService.createTextOutput(JSON.stringify({tx: [], error: 'empty'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    let parsed = JSON.parse(jsonStr);
    let result = {};
    try { result.tx = JSON.parse(parsed.tx || '[]'); } catch(e){ result.tx = []; }
    try { result.bands = JSON.parse(parsed.bands || '[]'); } catch(e){ result.bands = []; }
    try { result.fixed_templates = JSON.parse(parsed.fixed_templates || '[]'); } catch(e){ result.fixed_templates = []; }
    try { result.fixed_by_month = JSON.parse(parsed.fixed_by_month || '{}'); } catch(e){ result.fixed_by_month = {}; }
    try { result.wallets = JSON.parse(parsed.wallets || '[]'); } catch(e){ result.wallets = []; }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({'Access-Control-Allow-Origin': '*'});
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error', error: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
