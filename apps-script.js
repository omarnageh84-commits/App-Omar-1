
// Apps Script for AB Omar - حطه في Extensions > Apps Script في شيت AB Omar
function doPost(e){
  try{
    let data = JSON.parse(e.postData.contents);
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // اليومية
    if(data.daily){
      let sh = ss.getSheetByName('اليومية') || ss.insertSheet('اليومية');
      sh.clear();
      sh.appendRow(['id','type','item','person','amount','date','wallet','note']);
      data.daily.forEach(t=>{
        sh.appendRow([t.id, t.type, t.item, t.person||'', t.amount, t.date, t.wallet||'', t.note||'']);
      });
    }
    // الحضور
    if(data.attendance){
      let sh = ss.getSheetByName('الحضور') || ss.insertSheet('الحضور');
      sh.clear();
      sh.appendRow(['key','in','out','isHoliday']);
      for(let k in data.attendance){
        sh.appendRow([k, data.attendance[k].in, data.attendance[k].out, '']);
      }
    }
    // المهام
    if(data.tasks){
      let sh = ss.getSheetByName('المهام') || ss.insertSheet('المهام');
      sh.clear();
      sh.appendRow(['id','text','cat','done','date']);
      data.tasks.forEach(t=>{
        sh.appendRow([t.id, t.text, t.cat, t.done, '']);
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
  }catch(err){
    return ContentService.createTextOutput(JSON.stringify({error: err.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
