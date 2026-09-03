const themes = {
  teal: {'--bg':'#F0FDFA','--bg-soft':'#CCFBF1','--card':'#FFFFFF','--card-border':'#5EEAD4','--text':'#134E4A','--text-soft':'#0D9488','--hero':'#0F766E','--accent':'#14B8A6','--nav-bg':'rgba(255,255,255,0.92)'},
  dark: {'--bg':'#020617','--bg-soft':'#1E293B','--card':'#0F172A','--card-border':'#1E293B','--text':'#F1F5F9','--text-soft':'#94A3B8','--hero':'#0F766E','--accent':'#14B8A6','--nav-bg':'rgba(15,23,42,0.92)'}
};
function applyTheme(name, broadcast=false){
  const t = themes[name] || themes.teal;
  Object.entries(t).forEach(([k,v])=> document.documentElement.style.setProperty(k,v));
  try{ localStorage.setItem('omar_theme', name); }catch(e){}
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = t['--hero'];
  document.body.dataset.theme = name;
  if(broadcast){
    try{
      if(window.parent && window.parent!==window && window.parent.applyTheme){
        window.parent.applyTheme(name, false);
      }
    }catch(e){}
  }
}
window.themes = themes;
window.applyTheme = applyTheme;
(function(){
  try{
    const saved = localStorage.getItem('omar_theme') || 'teal';
    const cur = themes[saved] || themes.teal;
    Object.entries(cur).forEach(([k,v])=> document.documentElement.style.setProperty(k,v));
    const meta = document.querySelector('meta[name="theme-color"]');
    if(meta) meta.content = cur['--hero'];
  }catch(e){}
})();
window.addEventListener('storage', (e)=>{
  if(e.key==='omar_theme' && e.newValue){
    applyTheme(e.newValue, false);
  }
});
