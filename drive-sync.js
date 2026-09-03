// AB Omar - Drive JSON Backup V6 FINAL
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
    backup_date: new Date().toISOString()
  }
}
async function backupToDrive(showAlert=true){
  if(isBackingUp) return false;
  isBackingUp=true;
  let payload=getAllDataForBackup();
  try{
    await fetch(AB_OMAR_APPS_SCRIPT_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload)});
    localStorage.setItem('ab_omar_last_backup', new Date().toISOString());
    console.log('✅ Synced JSON to Drive:', (payload.daily||[]).length, 'daily |', (payload.tasks||[]).length, 'tasks');
    if(showAlert && window.showToast) showToast('✅ تم حفظ JSON');
    return true;
  }catch(err){return false;}finally{isBackingUp=false;}
}
async function restoreFromDrive(){
  if(!confirm('استرجاع من Drive؟')) return;
  try{
    let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{cache:'no-store'});
    let data=await res.json();
    if(data.error){alert(data.error);return;}
    if(data.daily) localStorage.setItem('omar_tx_v3',JSON.stringify(data.daily));
    if(data.tasks) localStorage.setItem('tasks_v6',JSON.stringify(data.tasks));
    if(data.attendance) localStorage.setItem('att_fixed_final',JSON.stringify(data.attendance));
    if(data.attendance_log) localStorage.setItem('attendance_log',JSON.stringify(data.attendance_log));
    if(data.important) localStorage.setItem('omar_important',JSON.stringify(data.important));
    if(data.debts) localStorage.setItem('debts_pro_v2',JSON.stringify(data.debts));
    alert('✅ تم الاسترجاع');location.reload();
  }catch(err){alert(err.message);}
}
function requestAutoBackup(){if(autoBackupTimer) clearTimeout(autoBackupTimer);autoBackupTimer=setTimeout(()=>{backupToDrive(false);},4000);}
(function(){const keys=['omar_tx_v3','tasks_v6','att_fixed_final','attendance_log','omar_important','debts_pro_v2'];const orig=localStorage.setItem;localStorage.setItem=function(k,v){orig.apply(this,arguments);if(keys.includes(k))requestAutoBackup();};})();
window.backupToDrive=backupToDrive;window.restoreFromDrive=restoreFromDrive;
console.log('✅ AB Omar JSON V6 Ready');
