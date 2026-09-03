const themes = {
  teal: {'--bg':'#F0FDFA','--bg-soft':'#CCFBF1','--card':'#FFFFFF','--card-border':'#99F6E0','--text':'#134E4A','--text-soft':'#0D9488','--hero':'#0F766E','--accent':'#0F766E','--nav-bg':'#FFFFFF'}
};
function applyTheme(name, save=true){
  const t = themes['teal'] || themes[name] || themes.teal;
  Object.entries(t).forEach(([k,v])=>document.documentElement.style.setProperty(k,v));
  try{ if(save) localStorage.setItem('omar_theme','teal'); }catch(e){}
  try{ document.querySelector('meta[name=theme-color]')?.setAttribute('content', t['--hero']||'#0F766E'); }catch(e){}
}
try{ applyTheme('teal', false); }catch(e){}
