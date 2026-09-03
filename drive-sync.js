// AB Omar - Drive JSON Backup V5 - يحفظ ملف JSON على Drive مباشرة
const AB_OMAR_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec";
let isBackingUp = false;
let autoBackupTimer = null;

function getAllDataForBackup(){
  return {
    daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
    attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
    attendance_log: JSON.parse(localStorage.getItem('attendance_log')||'[]'),
    tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]'),
    important: JSON.parse(localStorage.getItem('omar_important')||'[]'),
    debts: JSON.parse(localStorage.getItem('debts_pro_v2')||'[]'),
    backup_date: new Date().toISOString(),
    app_version: "v16-json"
  }
}

async function backupToDrive(showAlert=true){
  if(isBackingUp) return false;
  isBackingUp=true;
  let payload=getAllDataForBackup();
  try{
    if(showAlert) console.log('☁ جاري حفظ ملف omar-backup.json على Drive...');
    await fetch(AB_OMAR_APPS_SCRIPT_URL,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain'},
      body:JSON.stringify(payload)
    });
    localStorage.setItem('ab_omar_last_backup', new Date().toISOString());
    if(showAlert){
      console.log('✅ تم حفظ ملف JSON على Drive بنجاح');
      if(window.showToast) showToast('✅ تم حفظ omar-backup.json على Drive');
    }else{
      console.log('✅ Synced JSON to Drive:', (payload.daily||[]).length, 'daily |', (payload.tasks||[]).length, 'tasks | من', new Date().toLocaleTimeString());
    }
    return true;
  }catch(err){
    console.warn('Backup failed:', err.message);
    if(showAlert) alert('فشل النسخ: '+err.message);
    return false;
  }finally{isBackingUp=false;}
}

async function restoreFromDrive(){
  if(!confirm('هل تريد استرجاع ملف omar-backup.json من Google Drive؟ سيتم استبدال البيانات الحالية.')) return;
  try{
    let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{method:'GET',redirect:'follow',cache:'no-store'});
    let text=await res.text();
    let data=JSON.parse(text);
    if(data.error){alert('لا يوجد نسخة: '+data.error);return;}
    if(data.daily) localStorage.setItem('omar_tx_v3',JSON.stringify(data.daily));
    if(data.tasks) localStorage.setItem('tasks_v6',JSON.stringify(data.tasks));
    if(data.attendance) localStorage.setItem('att_fixed_final',JSON.stringify(data.attendance));
    if(data.attendance_log) localStorage.setItem('attendance_log',JSON.stringify(data.attendance_log));
    if(data.important) localStorage.setItem('omar_important',JSON.stringify(data.important));
    if(data.debts) localStorage.setItem('debts_pro_v2',JSON.stringify(data.debts));
    alert('✅ تم الاسترجاع من ملف JSON بنجاح - سيتم تحديث الصفحة');
    location.reload();
  }catch(err){
    alert('فشل الاسترجاع: '+err.message+'\nافتح اللينك ده وشوف: '+AB_OMAR_APPS_SCRIPT_URL);
  }
}

function requestAutoBackup(){
  if(autoBackupTimer) clearTimeout(autoBackupTimer);
  autoBackupTimer=setTimeout(()=>{backupToDrive(false);},4000);
}

(function(){
  const keysToWatch=['omar_tx_v3','tasks_v6','att_fixed_final','attendance_log','omar_important','debts_pro_v2'];
  const originalSetItem=localStorage.setItem;
  localStorage.setItem=function(k,v){
    originalSetItem.apply(this,arguments);
    if(keysToWatch.includes(k)){requestAutoBackup();}
  };
})();

window.addEventListener('load',()=>{
  let hasData=localStorage.getItem('omar_tx_v3')||localStorage.getItem('tasks_v6');
  if(!hasData){
    console.log('لا يوجد داتا محلية، محاولة استرجاع ملف JSON من Drive...');
    setTimeout(async()=>{
      try{
        let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{cache:'no-store'});
        let data=await res.json();
        if(!data.error && data.daily){
          if(confirm('وجدنا ملف omar-backup.json على Drive، هل تريد استرجاعه؟')){
            localStorage.setItem('omar_tx_v3',JSON.stringify(data.daily||[]));
            localStorage.setItem('tasks_v6',JSON.stringify(data.tasks||[]));
            localStorage.setItem('att_fixed_final',JSON.stringify(data.attendance||{}));
            localStorage.setItem('attendance_log',JSON.stringify(data.attendance_log||[]));
            localStorage.setItem('omar_important',JSON.stringify(data.important||[]));
            localStorage.setItem('debts_pro_v2',JSON.stringify(data.debts||[]));
            location.reload();
          }
        }
      }catch(e){}
    },2000);
  }
});

window.backupToDrive=backupToDrive;
window.restoreFromDrive=restoreFromDrive;
console.log('✅ AB Omar JSON Backup V5 Ready - يحفظ ملف omar-backup.json على Drive كل 4 ثواني');
