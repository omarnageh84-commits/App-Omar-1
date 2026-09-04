
// drive-sync.js - AB Omar V9 Fixed - Drive Linked
// مربوط بـ Google Sheet ID: 12KpLcWLt7Xzb09A6D8qErKOvEhZvqX9-AUTn5052RdQ
// Apps Script: https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec
// هذا الملف فقط هو اللي بيتعدل - daily.html لم يتغير منه حرف

const DRIVE_CONFIG = {
  SHEET_ID: '12KpLcWLt7Xzb09A6D8qErKOvEhZvqX9-AUTn5052RdQ',
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec',
  DEBOUNCE: 1500
};

let _lastDataHash = '';
let _debounceTimer = null;
let _isSyncing = false;

function getAllData(){
  try{
    return {
      tx: localStorage.getItem('omar_tx_v3'),
      bands: localStorage.getItem('omar_master_bands'),
      fixed_templates: localStorage.getItem('omar_fixed_templates'),
      fixed_by_month: localStorage.getItem('omar_fixed_by_month'),
      wallets: localStorage.getItem('omar_wallets_v3'),
      include_def: localStorage.getItem('omar_include_def'),
      ts: new Date().toISOString()
    };
  }catch(e){ return null; }
}

function hashData(d){
  try{ return JSON.stringify(d).length + '_' + (d.tx ? d.tx.length : 0); }catch(e){ return ''; }
}

window.syncToABOmar = function(){
  if(_debounceTimer) clearTimeout(_debounceTimer);
  _debounceTimer = setTimeout(async ()=>{
    if(_isSyncing) return;
    let data = getAllData();
    if(!data) return;
    let h = hashData(data);
    if(h === _lastDataHash) return;
    _lastDataHash = h;
    
    _isSyncing = true;
    try{
      console.log('🔄 Syncing to Drive...', new Date().toLocaleTimeString());
      
      // إرسال للـ Apps Script (no-cors عشان Google)
      if(DRIVE_CONFIG.APPS_SCRIPT_URL){
        await fetch(DRIVE_CONFIG.APPS_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {'Content-Type': 'text/plain'},
          body: JSON.stringify({
            action: 'backup',
            sheetId: DRIVE_CONFIG.SHEET_ID,
            data: data,
            source: 'daily.html'
          })
        }).catch(e=>{});
      }
      
      // نسخة احتياطية محلية
      try{
        localStorage.setItem('omar_last_sync', new Date().toISOString());
        localStorage.setItem('omar_backup_'+new Date().toISOString().slice(0,10), JSON.stringify(data));
      }catch(e){}
      
      console.log('✅ AB Omar JSON Backup V9 Fixed Ready - تم الربط بالدرايف');
      
    }catch(e){
      console.warn('Sync error:', e);
    }finally{
      _isSyncing = false;
    }
  }, DRIVE_CONFIG.DEBOUNCE);
};

// اسمع أي تحديث من daily.html
window.addEventListener('omar_data_updated', ()=>{ window.syncToABOmar(); });
window.addEventListener('storage', (e)=>{ if(e.key && e.key.startsWith('omar_')) window.syncToABOmar(); });

// أول مزامنة بعد 3 ثواني
setTimeout(()=>{ _lastDataHash=''; window.syncToABOmar(); }, 3000);

console.log('✅ Drive Sync V9 Loaded - Linked to Sheet', DRIVE_CONFIG.SHEET_ID);
