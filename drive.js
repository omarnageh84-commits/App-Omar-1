// drive-lite.js - نسخة خفيفة سريعة - متصل الآن / اترفع الآن
window.SCRIPT_URL = window.SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'; // غيره بالـ URL بتاعك

window.db = window.db || {
  daily: [],
  tasks: [],
  attendance: [],
  master: { wallets:['كاش','فودافون كاش','انستا باي'], incomeCats:['راتب'], expenseCats:['اكل'], debtPersons:[], amanatPersons:[] },
  theme: 'nile',
  lastSync: null
};

// تحميل محلي سريع أولاً
try{
  let local = localStorage.getItem('app-omar-db');
  if(local){
    let parsed = JSON.parse(local);
    window.db = Object.assign(window.db, parsed);
    console.log('[DRIVE-LITE] loaded from localStorage', window.db);
  }
}catch(e){ console.warn(e); }

function updateSyncStatus(txt, color){
  let el = document.getElementById('syncStatus');
  if(!el) return;
  el.textContent = txt;
  el.className = `text-xs px-2.5 py-1 rounded-full font-bold border ${color}`;
}

window.saveToLocal = function(){
  try{
    localStorage.setItem('app-omar-db', JSON.stringify(window.db));
  }catch(e){}
}

window.saveToDrive = async function(){
  window.saveToLocal();
  updateSyncStatus('جاري الرفع... 🔄', 'bg-yellow-50 text-yellow-700 border-yellow-200');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('محلي فقط 💾', 'bg-gray-100 text-gray-600 border-gray-200');
    return;
  }
  try{
    // نجمع كل البيانات
    let payload = {
      action: 'save',
      timestamp: new Date().toISOString(),
      data: window.db
    };
    // نستخدم no-cors عشان Google Apps Script
    await fetch(window.SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    window.db.lastSync = new Date().toISOString();
    window.saveToLocal();
    updateSyncStatus('اترفع الآن ✅ ' + new Date().toLocaleTimeString('ar-EG'), 'bg-emerald-50 text-emerald-700 border-emerald-200');
    setTimeout(()=> updateSyncStatus('متصل الآن 🟢', 'bg-emerald-50 text-emerald-700 border-emerald-200'), 2000);
  }catch(err){
    console.error('[DRIVE-LITE] save error', err);
    updateSyncStatus('خطأ رفع ⚠️', 'bg-red-50 text-red-700 border-red-200');
  }
}

window.loadFromDrive = async function(){
  updateSyncStatus('جاري التحميل... 🔄', 'bg-blue-50 text-blue-700 border-blue-200');
  if(!window.SCRIPT_URL || window.SCRIPT_URL.includes('YOUR_SCRIPT_ID')){
    updateSyncStatus('محلي فقط 💾', 'bg-gray-100 text-gray-600 border-gray-200');
    if(window.initApp) window.initApp();
    else if(window.renderContent) window.renderContent();
    return;
  }
  try{
    let res = await fetch(window.SCRIPT_URL + '?action=load&t=' + Date.now());
    let json = await res.json();
    if(json && json.data){
      window.db = Object.assign(window.db, json.data);
      window.saveToLocal();
      console.log('[DRIVE-LITE] loaded from Drive', window.db);
      updateSyncStatus('متصل الآن 🟢 ' + new Date().toLocaleTimeString('ar-EG'), 'bg-emerald-50 text-emerald-700 border-emerald-200');
    } else {
      updateSyncStatus('متصل الآن 🟢', 'bg-emerald-50 text-emerald-700 border-emerald-200');
    }
  }catch(err){
    console.error('[DRIVE-LITE] load error', err);
    updateSyncStatus('أوفلاين 📴', 'bg-gray-100 text-gray-600 border-gray-200');
  }
  if(window.initApp) window.initApp();
  else if(window.renderContent) window.renderContent();
}

// تحميل تلقائي عند فتح البرنامج
window.addEventListener('DOMContentLoaded', ()=>{
  window.loadFromDrive();
});

// لو النت رجع، حاول تحمل تاني
window.addEventListener('online', ()=>{ window.loadFromDrive(); });
