// AB Omar - Drive JSON Backup V8 - Fixed Stack Overflow - محمي من المسح الفاضي
const AB_OMAR_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV8WQb8MIN3Dxfc7IBBXIYjgza-xFq6p_ujvu66z_95mcfvr4t5ZpAXRzAZbdkCDgC/exec";
let isBackingUp = false;
let autoBackupTimer = null;
let isRestoring = false;
let watchEnabled = false;

function getAllDataForBackup(){
  try{
    return {
      daily: JSON.parse(localStorage.getItem('omar_tx_v3')||'[]'),
      attendance: JSON.parse(localStorage.getItem('att_fixed_final')||'{}'),
      attendance_log: JSON.parse(localStorage.getItem('attendance_log')||'[]'),
      tasks: JSON.parse(localStorage.getItem('tasks_v6')||'[]'),
      important: JSON.parse(localStorage.getItem('omar_important')||'[]'),
      debts: JSON.parse(localStorage.getItem('debts_pro_v2')||'[]'),
      backup_date: new Date().toISOString(),
      app_version: "v8-fixed"
    }
  }catch(e){ return {daily:[],attendance:{},attendance_log:[],tasks:[],important:[],debts:[]} }
}

function isDataEmpty(payload){
  if(!payload) return true;
  let dailyEmpty = !payload.daily || payload.daily.length===0;
  let tasksEmpty = !payload.tasks || payload.tasks.length===0;
  let logEmpty = !payload.attendance_log || payload.attendance_log.length===0;
  let attEmpty = !payload.attendance || Object.keys(payload.attendance).length===0;
  return dailyEmpty && tasksEmpty && logEmpty && attEmpty;
}

async function backupToDrive(showAlert=false, force=false){
  if(isBackingUp || isRestoring) return false;
  let payload=getAllDataForBackup();
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
    // استخدم الاصلية عشان متعملش loop
    if(window.__origSetItem){
      window.__origSetItem.call(localStorage,'ab_omar_last_backup', new Date().toISOString());
    }else{
      localStorage.setItem('ab_omar_last_backup', new Date().toISOString());
    }
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
    let data=JSON.parse(text);
    if(data.error){
      alert('لا يوجد نسخة: '+data.error);
      return;
    }
    if(isDataEmpty(data) && (data.daily||[]).length===0){
      alert('النسخة اللي على Drive فاضية');
      return;
    }
    let orig = window.__origSetItem || localStorage.setItem;
    orig.call(localStorage,'omar_tx_v3',JSON.stringify(data.daily||[]));
    orig.call(localStorage,'tasks_v6',JSON.stringify(data.tasks||[]));
    orig.call(localStorage,'att_fixed_final',JSON.stringify(data.attendance||{}));
    orig.call(localStorage,'attendance_log',JSON.stringify(data.attendance_log||[]));
    orig.call(localStorage,'omar_important',JSON.stringify(data.important||[]));
    orig.call(localStorage,'debts_pro_v2',JSON.stringify(data.debts||[]));
    alert('✅ تم الاسترجاع بنجاح\n' + (data.daily?.length||0) + ' يومية');
    location.reload();
  }catch(err){
    alert('فشل الاسترجاع: '+err.message);
  }finally{isRestoring=false;}
}

function requestAutoBackup(){
  if(autoBackupTimer) clearTimeout(autoBackupTimer);
  autoBackupTimer=setTimeout(()=>{backupToDrive(false,false);},4000);
}

// حماية من التحميل المزدوج - اهم حاجة لاصلاح Stack Overflow
if(!localStorage.setItem._isWrapped){
  const keysToWatch=['omar_tx_v3','tasks_v6','att_fixed_final','attendance_log','omar_important','debts_pro_v2'];
  const originalSetItem = localStorage.setItem.bind(localStorage);
  window.__origSetItem = originalSetItem;
  const wrapped = function(k,v){
    originalSetItem(k,v);
    if(watchEnabled && keysToWatch.includes(k)){
      requestAutoBackup();
    }
  };
  wrapped._isWrapped = true;
  localStorage.setItem = wrapped;
}

window.addEventListener('load',()=>{
  let hasData = localStorage.getItem('omar_tx_v3')||localStorage.getItem('tasks_v6')||localStorage.getItem('att_fixed_final');
  if(!hasData){
    console.log('لا يوجد داتا محلية، محاولة استرجاع تلقائي من Drive بعد ثانيتين...');
    setTimeout(async()=>{
      try{
        isRestoring=true;
        let res=await fetch(AB_OMAR_APPS_SCRIPT_URL+'?t='+Date.now(),{cache:'no-store'});
        let text=await res.text();
        let data=JSON.parse(text);
        if(!data.error && data.daily && data.daily.length>0){
          if(confirm('وجدنا نسخة محفوظة على Drive ('+data.daily.length+' يومية)، هل تريد استرجاعها؟')){
            let orig = window.__origSetItem || localStorage.setItem;
            orig.call(localStorage,'omar_tx_v3',JSON.stringify(data.daily||[]));
            orig.call(localStorage,'tasks_v6',JSON.stringify(data.tasks||[]));
            orig.call(localStorage,'att_fixed_final',JSON.stringify(data.attendance||{}));
            orig.call(localStorage,'attendance_log',JSON.stringify(data.attendance_log||[]));
            orig.call(localStorage,'omar_important',JSON.stringify(data.important||[]));
            orig.call(localStorage,'debts_pro_v2',JSON.stringify(data.debts||[]));
            location.reload();
            return;
          }
        }
      }catch(e){
        console.log('Auto restore failed:', e.message);
      }finally{
        isRestoring=false;
        watchEnabled=true;
      }
    },2000);
  }else{
    watchEnabled=true;
  }
});

window.backupToDrive=(showAlert)=>backupToDrive(showAlert,true);
window.restoreFromDrive=()=>restoreFromDrive(true);
console.log('✅ AB Omar JSON Backup V8 Fixed Ready - محمي من المسح الفاضي - بدون Stack Overflow');
