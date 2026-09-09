// bridge - عشان daily.html القديم اللي بينده syncToABOmar و drive-sync.js
// بيحول النداءات لـ drive.js الجديد
window.syncToABOmar = window.syncToABOmar || function(){
  try{
    if(window.saveToDrive) window.saveToDrive();
    if(window.saveToLocal) window.saveToLocal();
  }catch(e){ console.log('sync bridge', e); }
};
console.log('✅ drive-sync bridge loaded');
