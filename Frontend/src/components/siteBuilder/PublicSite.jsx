import React, { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { serverURL } from '../../utils/envExport';
import { PageRegistry, applyPalette } from './publicTheme.jsx';

function useQuery(){
  const { search } = useLocation();
  return useMemo(()=> Object.fromEntries(new URLSearchParams(search)), [search]);
}

// Page renderer uses centralized registry
const PageRenderer = ({ page, site }) => {
  const Comp = PageRegistry[page.key];
  if (!Comp) return null;
  return <div id={page.key}><Comp sections={page.sections} site={site} /></div>;
};

const PublicSite = () => {
  const q = useQuery();
  const sub = q.site;
  const [data,setData] = useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);

  const fetchSite = async () => {
    if(!sub) { setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${serverURL || 'http://localhost:8000'}/institutions/public/${sub}`);
      if(!res.ok){ throw new Error('Not found'); }
      const json = await res.json();
      setData(json.data);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchSite(); },[sub]);

  // Listen for localStorage flag to trigger live refresh after editor updates
  useEffect(()=>{
    const handler = (e) => {
      if (e.key === 'site_updated' && e.newValue === sub) {
        fetchSite();
        // clear flag
        setTimeout(()=> localStorage.removeItem('site_updated'), 500);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  },[sub]);

  const themeVars = useMemo(()=> data?.theme?.colors ? applyPalette(data.theme.colors) : {}, [data]);

  // Active section tracking (must be declared before any conditional returns)
  const [active,setActive] = useState('home');
  useEffect(()=>{
    const handler = () => {
      const sections = ['home','about','courses','student-login','staff-login','contact'];
      for (const id of sections){
        const el = document.getElementById(id);
        if(!el) continue;
        const rect = el.getBoundingClientRect();
        if(rect.top <= 120 && rect.bottom >= 160){ setActive(id); break; }
      }
    };
    handler();
    window.addEventListener('scroll', handler, { passive:true });
    return ()=> window.removeEventListener('scroll', handler);
  },[]);

  // Mobile menu state (also before conditional returns)
  const [open,setOpen] = useState(false);
  const toggle = () => setOpen(o=>!o);
  useEffect(()=>{ if(open) document.body.style.overflow='hidden'; else document.body.style.overflow='auto'; },[open]);

  if (!sub) return <div className="p-8 text-center">Missing site parameter.</div>;
  if (loading) return <div className="p-8 text-center">Loading site...</div>;
  if (error) return <div className="p-8 text-center">Site not found.</div>;

  const orderedNav = [...(data.nav||[])].filter(n=>n.isVisible!==false).sort((a,b)=>a.order-b.order);
  const centerNav = orderedNav.filter(i=>i.position==='center');
  const rightNav = orderedNav.filter(i=>i.position==='right');

  const pages = data.pages || [];

  return (
    <div style={themeVars} className="min-h-screen bg-base-200 text-base-content" >
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-base-100/80 bg-base-100/95 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center gap-6 relative">
          <a href="#home" className="flex items-center gap-3 shrink-0 z-10">
            {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-10 w-10 object-cover rounded-lg ring-1 ring-base-300" />}
            <span className="font-bold text-lg tracking-tight">{data.name}</span>
          </a>
          {/* Absolutely centered nav on desktop */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            {centerNav.map(item=> {
              const target = (item.url||'').replace('#','');
              const isActive = active === target;
              return (
                <a key={item.label} href={item.url} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive? 'bg-primary text-primary-content shadow-sm':'hover:bg-base-200'}`}>{item.label}</a>
              );
            })}
          </nav>
          <div className="hidden md:flex items-center gap-3 ml-auto z-10">
            {rightNav.map(item=> <a key={item.label} href={item.url} className="btn btn-sm btn-outline">{item.label}</a>)}
          </div>
          {/* Mobile button */}
            <button className="md:hidden ml-auto btn btn-sm" onClick={toggle} aria-label="Menu">{open? 'Close':'Menu'}</button>
        </div>
        {/* Mobile panel */}
        {open && (
          <div className="md:hidden border-t border-base-300 bg-base-100/95 backdrop-blur animate-fade-in">
            <nav className="px-4 py-4 flex flex-col gap-2">
              {centerNav.map(item=>{
                const target = (item.url||'').replace('#','');
                const isActive = active === target;
                return <a key={item.label} href={item.url} onClick={()=>setOpen(false)} className={`px-4 py-2 rounded-md text-sm font-medium ${isActive? 'bg-primary text-primary-content':'hover:bg-base-200'}`}>{item.label}</a>;
              })}
              <div className="pt-2 border-t border-base-300 flex flex-col gap-2">
                {rightNav.map(item=> <a key={item.label} href={item.url} onClick={()=>setOpen(false)} className="btn btn-sm btn-outline justify-start">{item.label}</a>)}
              </div>
            </nav>
          </div>
        )}
      </header>
      <main className="px-4 md:px-10 max-w-7xl mx-auto py-12">
        {pages.map(p => <PageRenderer key={p.key} page={p} site={data} />)}
      </main>
      <footer className="px-6 py-10 border-t text-xs text-center opacity-70 mt-12">© {new Date().getFullYear()} {data.name}. All rights reserved.</footer>
    </div>
  );
};

export default PublicSite;
