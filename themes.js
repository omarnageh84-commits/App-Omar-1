const themes = {
  teal: {'--bg':'#F0FDFA','--bg-soft':'#CCFBF1','--card':'#FFFFFF','--card-border':'#5EEAD4','--text':'#134E4A','--text-soft':'#0D9488','--hero':'#0F766E','--accent':'#14B8A6','--nav-bg':'rgba(255,255,255,0.92)'},
  green: {'--bg':'#F0FDF4','--bg-soft':'#DCFCE7','--card':'#FFFFFF','--card-border':'#BBF7D0','--text':'#14532D','--text-soft':'#4ADE80','--hero':'#16A34A','--accent':'#22C55E','--nav-bg':'rgba(255,255,255,0.92)'},
  dark: {'--bg':'#020617','--bg-soft':'#1E293B','--card':'#0F172A','--card-border':'#334155','--text':'#F8FAFC','--text-soft':'#64748B','--hero':'#22C55E','--accent':'#16A34A','--nav-bg':'rgba(15,23,42,0.92)'},
  blue: {'--bg':'#EFF6FF','--bg-soft':'#DBEAFE','--card':'#FFFFFF','--card-border':'#93C5FD','--text':'#1E3A8A','--text-soft':'#3B82F6','--hero':'#2563EB','--accent':'#1D4ED8','--nav-bg':'rgba(255,255,255,0.92)'},
  purple: {'--bg':'#F5F3FF','--bg-soft':'#EDE9FE','--card':'#FFFFFF','--card-border':'#C4B5FD','--text':'#4C1D95','--text-soft':'#8B5CF6','--hero':'#7C3AED','--accent':'#6D28D9','--nav-bg':'rgba(255,255,255,0.92)'},
  orange: {'--bg':'#FFFBEB','--bg-soft':'#FEF3C7','--card':'#FFFFFF','--card-border':'#FCD34D','--text':'#78350F','--text-soft':'#D97706','--hero':'#EA580C','--accent':'#F97316','--nav-bg':'rgba(255,255,255,0.92)'},
  rose: {'--bg':'#FFF1F2','--bg-soft':'#FFE4E6','--card':'#FFFFFF','--card-border':'#FDA4AF','--text':'#881337','--text-soft':'#E11D48','--hero':'#E11D48','--accent':'#BE123C','--nav-bg':'rgba(255,255,255,0.92)'},
  night: {'--bg':'#0B0F1A','--bg-soft':'#1A2332','--card':'#151D2A','--card-border':'#2A3441','--text':'#E2E8F0','--text-soft':'#64748B','--hero':'#F59E0B','--accent':'#FBBF24','--nav-bg':'rgba(21,29,42,0.92)'}
};

function applyTheme(name, broadcast=true){
  const t = themes[name] || themes.teal;
  Object.entries(t).forEach(([k,v])=> document.documentElement.style.setProperty(k,v));
  try{ localStorage.setItem('omar_theme', name); }catch(e){}
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content = t['--hero'];
  
  if(broadcast){
    try{
      if(window.parent && window.parent!==window && window.parent.applyTheme){
        window.parent.applyTheme(name, false);
      }
    }catch(e){}
    try{
      const frames = document.querySelectorAll('iframe.page, iframe');
      frames.forEach(f=>{
        try{
          if(f.contentWindow && f.contentWindow.applyTheme){
            f.contentWindow.applyTheme(name, false);
          }
        }catch(e){}
      });
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
