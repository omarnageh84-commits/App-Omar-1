// AB Omar - Drive JSON Backup V7 - FINAL Protected - يمنع مسح الدرايف بالفاضي
const AB_OMAR_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec";
let isBackingUp = false;
let autoBackupTimer = null;
let isRestoring = false;

function getAllDataForBackup(){
  return {
    daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
    attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
    attendance_log: JSON.parse(localStorage.getItem('attendance_log')||'[]'),
    tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]'),
    important: JSON.parse(localStorage.getItem('omar_important')||'[]'),
    debts: JSON.parse(localStorage.getItem('debts_pro_v2')||'[]'),
    backup_date: new Date().toISOString(),
    app_version: "v7-protected"
  }
}

function isDataEmpty(payload){
  let dailyEmpty = !payload.daily || payload.daily.length===0;
  let tasksEmpty = !payload.tasks || payload.tasks.length===0;
  let logEmpty = !payload.attendance_log || payload.attendance_log.length===0;
  let attEmpty = !payload.attendance || Object.keys(payload.attendance).length===0;
  // لو كله فاضي يبقى فاضي
  return dailyEmpty && tasksEmpty && logEmpty && attEmpty;
}

async function backupToDrive(showAlert=false, force=false){
  if(isBackingUp || isRestoring) return false;
  let payload=getAllDataForBackup();
  
  // حماية: لو الداتا المحلية فاضية تماما مترفعش الا لو force=true (زرار يدوي)
  if(!force && isDataEmpty(payload)){
    console.log('⚠️ Local empty - skipping auto backup to protect Drive file');
    return false;
  }
  
  isBackingUp=true;
  try{
    if(showAlert) console.log('☁ جاري حفظ JSON على Drive...');
    await fetch(AB_OMAR_APPS_SCRIPT_URL,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain'},
      body:JSON.stringify(payload)
    });
    localStorage.setItem('ab_omar_last_backup', new Date().toISOString());
    console.log('✅ Synced JSON to Drive:', (payload.daily||[]).length, 'daily |', (payload.tasks||[]).length, 'tasks |', new Date().toLocaleTimeString());
    if(showAlert && window.showToast) showToast('✅ تم حفظ JSON على Drive');
    return true;
  }catch(err){
    console.warn('Backup failed:', err.message);
    return false;
  }finally{isBackingUp=false;}
}

async function restoreFromDrive(manual=false){
  if(!manual){
    if(!confirm('وجدنا نسخة محفوظة على Drive، هل تريد استرجاعها؟')) return;
  } else {
    if(!confirm('هل تريد استرجاع ملف JSON من Google Drive؟ سيتم استبدال البيانات الحالية.')) return;
  }
  isRestoring=true;
  try{
    console.log('☁ جاري الاسترجاع من Drive...');
    let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{method:'GET',redirect:'follow',cache:'no-store'});
    let text=await res.text();
    console.log('Response length:', text.length);
    let data=JSON.parse(text);
    if(data.error){
      alert('لا يوجد نسخة: '+data.error+'\nافتح الدرايف وشوف AB_Omar_Backup_2026-09-03_.json');
      return;
    }
    // حتى لو فيه daily واحد بس رجعه، لكن لو فاضي خالص قوله
    if(isDataEmpty(data) && (data.daily||[]).length===0){
      alert('النسخة اللي على Drive فاضية برضه - شوف الملفات المؤرخة في الدرايف');
      return;
    }
    if(data.daily) localStorage.setItem('omar_tx_v3',JSON.stringify(data.daily));
    if(data.tasks) localStorage.setItem('tasks_v6',JSON.stringify(data.tasks));
    if(data.attendance) localStorage.setItem('att_fixed_final',JSON.stringify(data.attendance));
    if(data.attendance_log) localStorage.setItem('attendance_log',JSON.stringify(data.attendance_log));
    if(data.important) localStorage.setItem('omar_important',JSON.stringify(data.important));
    if(data.debts) localStorage.setItem('debts_pro_v2',JSON.stringify(data.debts));
    alert('✅ تم الاسترجاع بنجاح - سيتم تحديث الصفحة\n' + (data.daily?.length||0) + ' يومية | ' + (data.tasks?.length||0) + ' مهمة');
    location.reload();
  }catch(err){
    alert('فشل الاسترجاع: '+err.message+'\nجرب افتح اللينك ده مباشر: '+AB_OMAR_APPS_SCRIPT_URL);
  }finally{isRestoring=false;}
}

function requestAutoBackup(){
  if(autoBackupTimer) clearTimeout(autoBackupTimer);
  autoBackupTimer=setTimeout(()=>{backupToDrive(false,false);},4000);
}

// مراقبة التغييرات - لكن بعد تحميل الصفحة ب 5 ثواني عشان ندي فرصة للاسترجاع
let watchEnabled=false;
(function(){
  const keysToWatch=['omar_tx_v3','tasks_v6','att_fixed_final','attendance_log','omar_important','debts_pro_v2'];
  const originalSetItem=localStorage.setItem;
  localStorage.setItem=function(k,v){
    originalSetItem.apply(this,arguments);
    if(watchEnabled && keysToWatch.includes(k)){
      requestAutoBackup();
    }
  };
})();

// عند التحميل
window.addEventListener('load',()=>{
  let hasData=localStorage.getItem('omar_tx_v3')||localStorage.getItem('tasks_v6')||localStorage.getItem('att_fixed_final');
  if(!hasData){
    console.log('لا يوجد داتا محلية، محاولة استرجاع تلقائي من Drive بعد ثانيتين...');
    setTimeout(async()=>{
      try{
        isRestoring=true;
        let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{cache:'no-store'});
        let text=await res.text();
        let data=JSON.parse(text);
        console.log('Auto restore check, data length:', text.length, 'daily:', data.daily?.length);
        if(!data.error && data.daily && data.daily.length>0){
          if(confirm('وجدنا نسخة محفوظة على Drive ('+data.daily.length+' يومية، '+ (data.tasks?.length||0)+' مهام)، هل تريد استرجاعها؟')){
            localStorage.setItem('omar_tx_v3',JSON.stringify(data.daily||[]));
            localStorage.setItem('tasks_v6',JSON.stringify(data.tasks||[]));
            localStorage.setItem('att_fixed_final',JSON.stringify(data.attendance||{}));
            localStorage.setItem('attendance_log',JSON.stringify(data.attendance_log||[]));
            localStorage.setItem('omar_important',JSON.stringify(data.important||[]));
            localStorage.setItem('debts_pro_v2',JSON.stringify(data.debts||[]));
            location.reload();
            return;
          }
        } else if(data.error){
          console.log('No backup on Drive:', data.error);
        }
      }catch(e){
        console.log('Auto restore failed:', e.message);
      }finally{
        isRestoring=false;
        watchEnabled=true; // فعل المراقبة بعد محاولة الاسترجاع
      }
    },2000);
  } else {
    watchEnabled=true;
  }
});

window.backupToDrive=(showAlert)=>backupToDrive(showAlert,true); // الزرار اليدوي يرفع حتى لو فاضي
window.restoreFromDrive=()=>restoreFromDrive(true);
console.log('✅ AB Omar JSON Backup V7 Protected Ready - محمي من المسح الفاضي');
