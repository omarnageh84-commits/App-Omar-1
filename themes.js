const themes = {
  light: { "--bg": "#F8FAFC", "--bg-soft": "#F1F5F9", "--card": "#FFFFFF", "--card-border": "#E2E8F0", "--text": "#0F172A", "--text-soft": "#94A3B8", "--primary": "#0F172A", "--hero": "#0F172A", "--accent": "#334155", "--nav-bg": "rgba(255,255,255,0.92)" },
  dark: { "--bg": "#0F172A", "--bg-soft": "#1E293B", "--card": "#1E293B", "--card-border": "#334155", "--text": "#F1F5F9", "--text-soft": "#64748B", "--primary": "#22C55E", "--hero": "#020617", "--accent": "#22C55E", "--nav-bg": "rgba(15,23,42,0.92)" },
  black: { "--bg": "#F4F4F5", "--bg-soft": "#E4E4E7", "--card": "#FFFFFF", "--card-border": "#D4D4D8", "--text": "#18181B", "--text-soft": "#71717A", "--primary": "#18181B", "--hero": "#18181B", "--accent": "#18181B", "--nav-bg": "rgba(255,255,255,0.92)" },
  green: { "--bg": "#F0FDF4", "--bg-soft": "#DCFCE7", "--card": "#FFFFFF", "--card-border": "#BBF7D0", "--text": "#14532D", "--text-soft": "#4ADE80", "--primary": "#16A34A", "--hero": "#16A34A", "--accent": "#22C55E", "--nav-bg": "rgba(240,253,244,0.92)" },
  blue: { "--bg": "#EFF6FF", "--bg-soft": "#DBEAFE", "--card": "#FFFFFF", "--card-border": "#BFDBFE", "--text": "#1E3A8A", "--text-soft": "#60A5FA", "--primary": "#2563EB", "--hero": "#2563EB", "--accent": "#3B82F6", "--nav-bg": "rgba(239,246,255,0.92)" },
  red: { "--bg": "#FFF1F2", "--bg-soft": "#FFE4E6", "--card": "#FFFFFF", "--card-border": "#FECDD3", "--text": "#881337", "--text-soft": "#FB7185", "--primary": "#E11D48", "--hero": "#E11D48", "--accent": "#F43F5E", "--nav-bg": "rgba(255,241,242,0.92)" },
  purple: { "--bg": "#F5F3FF", "--bg-soft": "#EDE9FE", "--card": "#FFFFFF", "--card-border": "#DDD6FE", "--text": "#4C1D95", "--text-soft": "#A78BFA", "--primary": "#7C3AED", "--hero": "#7C3AED", "--accent": "#8B5CF6", "--nav-bg": "rgba(245,243,255,0.92)" },
  orange: { "--bg": "#FFFBEB", "--bg-soft": "#FEF3C7", "--card": "#FFFFFF", "--card-border": "#FDE68A", "--text": "#92400E", "--text-soft": "#FBBF24", "--primary": "#D97706", "--hero": "#D97706", "--accent": "#F59E0B", "--nav-bg": "rgba(255,251,235,0.92)" },
  clay: { "--bg": "#FDF6F3", "--bg-soft": "#F5E6E0", "--card": "#FFFFFF", "--card-border": "#E7D5CC", "--text": "#5D4037", "--text-soft": "#A1887F", "--primary": "#A0522D", "--hero": "#8D4A32", "--accent": "#BC6C4E", "--nav-bg": "rgba(253,246,243,0.92)" },
  teal: { "--bg": "#F0FDFA", "--bg-soft": "#CCFBF1", "--card": "#FFFFFF", "--card-border": "#99F6E4", "--text": "#134E4A", "--text-soft": "#2DD4BF", "--primary": "#0D9488", "--hero": "#0D9488", "--accent": "#14B8A6", "--nav-bg": "rgba(240,253,250,0.92)" },
  pink: { "--bg": "#FDF2F8", "--bg-soft": "#FCE7F3", "--card": "#FFFFFF", "--card-border": "#FBCFE8", "--text": "#831843", "--text-soft": "#F472B6", "--primary": "#DB2777", "--hero": "#DB2777", "--accent": "#EC4899", "--nav-bg": "rgba(253,242,248,0.92)" },
  yellow: { "--bg": "#FEFCE8", "--bg-soft": "#FEF9C3", "--card": "#FFFFFF", "--card-border": "#FEF08A", "--text": "#713F12", "--text-soft": "#EAB308", "--primary": "#CA8A04", "--hero": "#CA8A04", "--accent": "#EAB308", "--nav-bg": "rgba(254,252,232,0.92)" },
  indigo: { "--bg": "#EEF2FF", "--bg-soft": "#E0E7FF", "--card": "#FFFFFF", "--card-border": "#C7D2FE", "--text": "#312E81", "--text-soft": "#818CF8", "--primary": "#4F46E5", "--hero": "#4F46E5", "--accent": "#6366F1", "--nav-bg": "rgba(238,242,255,0.92)" }
};
const basicThemes = ["light","dark","black","green","blue"];
const moreThemes = ["red","purple","orange","clay","teal","pink","yellow","indigo"];

// قناة لحظية بين كل الصفحات
let themeChannel;
try{ themeChannel = new BroadcastChannel('omar_theme_channel_v9'); }catch(e){ themeChannel = {postMessage:()=>{}, onmessage:null}; }

function applyTheme(name){
  let t=themes[name]; if(!t){ t=themes['light']; name='light'; }
  try{
    Object.entries(t).forEach(([k,v])=>{ if(document.documentElement) document.documentElement.style.setProperty(k,v); });
    localStorage.setItem('omar_theme',name); localStorage.setItem('theme',name);
    localStorage.setItem('omar_theme_sync', Date.now().toString());
    let meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.content=t["--hero"];
    document.querySelectorAll('.theme-dot,.tdot').forEach(d=>{ if(d.dataset) d.classList.toggle('active',d.dataset.theme===name); });
    const curDot=document.getElementById('currentDot'); const curName=document.getElementById('currentName');
    if(curDot) curDot.style.background = t["--primary"];
    if(curName) curName.textContent = name;
    try{ document.querySelectorAll('.page').forEach(f=>{ if(f.contentDocument && f.contentDocument.documentElement){ Object.entries(t).forEach(([k,v])=>{ try{ f.contentDocument.documentElement.style.setProperty(k,v); }catch(e){} }); } }); }catch(e){}
    try{ themeChannel.postMessage({type:'theme', name}); }catch(e){}
  }catch(e){ console.warn('Theme apply warning:', e.message); }
}
function applyThemeToDoc(doc, name){
  let t=themes[name]||themes['light'];
  if(!doc || !doc.documentElement) return;
  Object.entries(t).forEach(([k,v])=>{ try{ doc.documentElement.style.setProperty(k,v); }catch(e){} });
}
function renderThemeDropdown(){
  const menu=document.getElementById('themeMenu');
  const container=document.getElementById('themeDots');
  const target=menu||container;
  if(!target) return;
  const createItem=(name)=>{
    const t=themes[name]; const div=document.createElement('div');
    div.className='theme-dot'; div.dataset.theme=name;
    div.style.cssText=`display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;transition:.15s;border:1px solid transparent`;
    div.innerHTML=`<span style="width:18px;height:18px;border-radius:50%;background:${t["--primary"]};display:inline-block;border:2px solid ${t["--card-border"]}"></span><span style="font-size:9px;font-weight:800;flex:1">${name}</span><span style="width:8px;height:8px;border-radius:50%;background:${t["--hero"]}"></span>`;
    div.onmouseenter=()=>div.style.background=`var(--bg-soft)`; div.onmouseleave=()=>div.style.background=`transparent`;
    div.onclick=()=>{ applyTheme(name); if(menu) menu.style.display='none'; };
    return div;
  };
  if(menu){
    menu.innerHTML=''; const basicLabel=document.createElement('div'); basicLabel.textContent='— أساسي (فاتح/غامق) —'; basicLabel.style.cssText='font-size:8px;color:var(--text-soft);font-weight:800;padding:6px 4px;text-align:center'; menu.appendChild(basicLabel);
    basicThemes.forEach(n=>{ if(themes[n]) menu.appendChild(createItem(n)); });
    const divider=document.createElement('div'); divider.style.cssText='height:1px;background:var(--card-border);margin:8px 0'; menu.appendChild(divider);
    const moreLabel=document.createElement('div'); moreLabel.textContent='— المزيد —'; moreLabel.style.cssText='font-size:8px;color:var(--text-soft);font-weight:800;padding:6px 4px;text-align:center'; menu.appendChild(moreLabel);
    moreThemes.forEach(n=>{ if(themes[n]) menu.appendChild(createItem(n)); });
  }else if(container && container.children.length===0){
    basicThemes.forEach(n=>{ if(themes[n]) container.appendChild(createItem(n)); });
  }
}
function toggleThemeMenu(){
  const menu=document.getElementById('themeMenu');
  if(!menu){ renderThemeDropdown(); return; }
  const isHidden = menu.style.display==='none' || !menu.style.display || menu.style.display==='';
  menu.style.display = isHidden ? 'block' : 'none';
  if(isHidden) renderThemeDropdown();
}
window.applyTheme=applyTheme;
window.applyThemeToDoc=applyThemeToDoc;
window.themes=themes;
window.renderThemeDropdown=renderThemeDropdown;
window.renderThemeDots=renderThemeDropdown;
window.toggleThemeMenu=toggleThemeMenu;

// استقبال لحظي من صفحات تانية
try{
  themeChannel.onmessage = (e)=>{ if(e.data?.type==='theme' && e.data?.name){ const t=themes[e.data.name]; if(t){ Object.entries(t).forEach(([k,v])=>{ try{ document.documentElement.style.setProperty(k,v); }catch(_){} }); const curDot=document.getElementById('currentDot'); const curName=document.getElementById('currentName'); if(curDot) curDot.style.background=t["--primary"]; if(curName) curName.textContent=e.data.name; } } };
}catch(e){}
window.addEventListener('storage',(e)=>{
  if(e.key==='omar_theme' || e.key==='omar_theme_sync' || e.key==='theme'){
    const saved=localStorage.getItem('omar_theme')||'light'; const t=themes[saved]; if(t){ Object.entries(t).forEach(([k,v])=>{ try{ document.documentElement.style.setProperty(k,v); }catch(_){} }); const curDot=document.getElementById('currentDot'); const curName=document.getElementById('currentName'); if(curDot) curDot.style.background=t["--primary"]; if(curName) curName.textContent=saved; }
  }
});
document.addEventListener('DOMContentLoaded',()=>{ renderThemeDropdown(); applyTheme(localStorage.getItem('omar_theme')||'light'); });
if(document.readyState!=='loading'){ renderThemeDropdown(); applyTheme(localStorage.getItem('omar_theme')||'light'); }
document.addEventListener('click',(e)=>{
  const menu=document.getElementById('themeMenu'); const btn=document.getElementById('themeBtn');
  if(!menu||!btn) return; if(!menu.contains(e.target) && !btn.contains(e.target)) menu.style.display='none';
});
