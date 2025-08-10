import React, { useState, useEffect } from 'react';
import PaletteSelect from './PaletteSelect';
import useInstitutionDraft from '../../hooks/useInstitutionDraft';
import { paletteToCssVars } from '../../theme/palettes';
import SitePagesEditor from './SitePagesEditor';
import ImageUploader from './ImageUploader';
import usePlanDetails from '../../hooks/usePlanDetails';

const steps = ['Palette','Basic Info','Pages','Review'];

const InstitutionWizard = () => {
  const urlParts = window.location.pathname.split('/');
  const planIdFromUrl = urlParts.includes('my-plan') ? urlParts[urlParts.indexOf('my-plan') + 1] : null;
  const { saveDraft, publish, update, draft, saving } = useInstitutionDraft(planIdFromUrl);
  const [step, setStep] = useState(0);
  const [palette, setPalette] = useState(null);
  const { plan: planDetails } = usePlanDetails(planIdFromUrl);
  const inferredType = planDetails?.parentPlanType?.toLowerCase?.() || 'school';
  const [basic, setBasic] = useState({ name:'', type: inferredType, tagline:'', email:'', phone:'', address:'' });
  const [logoUrl, setLogoUrl] = useState('');
  const [pages, setPages] = useState([]);
  const [error,setError]=useState(null);
  const [customDomainInput,setCustomDomainInput] = useState('');
  const [customDomainInfo,setCustomDomainInfo] = useState(null);

  useEffect(()=>{
    if(planDetails?.parentPlanType){
      setBasic(b=> ({ ...b, type: planDetails.parentPlanType.toLowerCase() }));
    }
  },[planDetails]);

  // prefill when existing draft loaded
  useEffect(()=>{
    if(draft){
      setBasic(b=>({
        ...b,
        name: draft.name || b.name,
        tagline: draft.tagline || b.tagline,
        email: draft.contact?.email || b.email,
        phone: draft.contact?.phone || b.phone,
        address: draft.contact?.address || b.address,
        type: draft.type || b.type
      }));
      if(draft.logoUrl) setLogoUrl(draft.logoUrl);
      if(draft.pages?.length) setPages(draft.pages);
      if(draft.theme?.paletteKey && !palette){
        setPalette({ key: draft.theme.paletteKey, colors: draft.theme.colors || {} });
      }
    }
  },[draft, palette]);

  const requestDomain = async () => {
    if(!draft?._id || !customDomainInput) return;
    try {
      const token = await (async ()=>{
        // call backend
        const res = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/institutions/${draft._id}/custom-domain/request`, {
          method:'POST',
          headers:{ 'Content-Type':'application/json', ...(window.__clerkToken? { Authorization: `Bearer ${window.__clerkToken}` }:{}) },
          body: JSON.stringify({ domain: customDomainInput })
        });
        return await res.json();
      })();
      if(token.success){ setCustomDomainInfo(token.data); }
    } catch(e){ console.error(e); }
  };
  const verifyDomain = async () => {
    if(!draft?._id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:8000'}/institutions/${draft._id}/custom-domain/verify`, { method:'POST', headers:{ ...(window.__clerkToken? { Authorization: `Bearer ${window.__clerkToken}` }:{}) } });
      const json = await res.json();
      if(json.success) setCustomDomainInfo({ ...customDomainInfo, ...json.data });
    } catch(e){ console.error(e); }
  };

  const next = async () => {
    try {
      if (step === 0) {
        if (!palette) return setError('Select a palette');
  if(!palette?.key) return setError('Palette missing');
  const payload = { name: basic.name || 'My Institution', type: basic.type, paletteKey: palette.key, colors: palette.colors, tagline: basic.tagline, contact:{ email: basic.email, phone: basic.phone, address: basic.address }, logoUrl, sourcePlanId: planIdFromUrl };
  if (draft?.status === 'published') { const upd = await update(payload); if(upd?.slug) localStorage.setItem('site_updated', upd.slug); } else await saveDraft(payload);
      }
      if (step === 1) {
        if (!basic.name) return setError('Name required');
  if(!palette?.key) return setError('Palette missing');
  const payload = { name: basic.name, type: basic.type, paletteKey: palette.key, colors: palette.colors, tagline: basic.tagline, contact:{ email: basic.email, phone: basic.phone, address: basic.address }, logoUrl, sourcePlanId: planIdFromUrl };
  if (draft?.status === 'published') { const upd = await update(payload); if(upd?.slug) localStorage.setItem('site_updated', upd.slug); } else await saveDraft(payload);
      }
      if (step === 2) {
  if(!palette?.key) return setError('Palette missing');
  const payload = { name: basic.name, type: basic.type, paletteKey: palette.key, colors: palette.colors, tagline: basic.tagline, contact:{ email: basic.email, phone: basic.phone, address: basic.address }, pages, logoUrl, sourcePlanId: planIdFromUrl };
  if (draft?.status === 'published') { const upd = await update(payload); if(upd?.slug) localStorage.setItem('site_updated', upd.slug); } else await saveDraft(payload);
      }
      setError(null);
      setStep(s => Math.min(s+1, steps.length-1));
    } catch(e){ setError(e.message || 'Save failed'); }
  };
  const back = ()=> setStep(s => Math.max(s-1,0));

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-8">
      <ProgressBar step={step} />
      {error && <div className="alert alert-error">{error}</div>}
      {step === 0 && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">Choose a Color Palette</h1>
          <PaletteSelect value={palette} onChange={p=>{ setPalette(p); setError(null); }} />
        </div>
      )}
  {step === 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <Input label="Institution Name" value={basic.name} onChange={e=>setBasic({...basic,name:e.target.value})} />
            <div className="text-xs opacity-70 -mt-2 mb-2">Type: <span className="font-medium">{basic.type}</span> (auto from plan)</div>
            <Input label="Tagline" value={basic.tagline} onChange={e=>setBasic({...basic,tagline:e.target.value})} />
            <Input label="Email" value={basic.email} onChange={e=>setBasic({...basic,email:e.target.value})} />
            <Input label="Phone" value={basic.phone} onChange={e=>setBasic({...basic,phone:e.target.value})} />
            <Input label="Address" value={basic.address} onChange={e=>setBasic({...basic,address:e.target.value})} />
            <ImageUploader label="Logo" value={logoUrl} onChange={setLogoUrl} aspectHint="Square" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Live Preview</h2>
            {palette ? (
              <div className="rounded-xl border shadow p-6 space-y-4" style={paletteToCssVars(palette.colors)}>
                <div className="text-3xl font-bold" style={{ color: palette.colors.primary }}>{basic.name || 'Institution Name'}</div>
                <div className="opacity-70" style={{ color: palette.colors.neutral }}>{basic.tagline || 'Tagline here'}</div>
                <button className="btn btn-sm" style={{ background: palette.colors.primary, borderColor: palette.colors.primary, color: palette.colors.base100 }}>Explore</button>
              </div>
            ) : <div className="text-sm opacity-60">Select a palette first.</div>}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Pages & Content</h2>
          <SitePagesEditor value={pages} onChange={setPages} />
          <div className="text-xs opacity-60">Images: Upload to Cloudinary and paste URLs. Student/Admin login sections just show info for now.</div>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review</h2>
          <div className="card bg-base-100 shadow">
            <div className="card-body">
              <h3 className="card-title">{basic.name}</h3>
              <p>{basic.tagline}</p>
              <div className="text-sm opacity-70">Type: {basic.type}</div>
              {draft && (
                <div className="mt-2 text-xs space-y-1">
                  <div>Draft ID: {draft._id}</div>
                  <div>Status: <span className={`badge badge-${draft.status==='published'?'success':'warning'}`}>{draft.status}</span></div>
                  {draft.subdomain && draft.status==='published' && (
                    <div className="text-xs">Preview URL: <code className="break-all">http://localhost:3000/public-site?site={draft.subdomain}</code></div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="alert alert-info text-sm">On localhost we emulate subdomains using a query param (?site=slug). After publish you can still update basic info, nav, palette and images but structural page layout locks.</div>
          <div className="divider">Custom Domain (optional)</div>
          <div className="space-y-3">
            <div className="text-sm opacity-70">Point your own domain. Enter domain without http (e.g. school.com or www.school.com). After requesting, create a TXT record: <code>_edvixo-verify.YOURDOMAIN</code> = provided token (placeholder) then Verify.</div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Custom Domain" value={customDomainInput} onChange={e=>setCustomDomainInput(e.target.value)} placeholder="school.com" />
              </div>
              <button type="button" className="btn" onClick={requestDomain} disabled={!customDomainInput || !draft}>Request</button>
              <button type="button" className="btn btn-outline" onClick={verifyDomain} disabled={!draft}>Verify</button>
            </div>
            {customDomainInfo && (
              <div className="text-xs rounded bg-base-200 p-3 space-y-1">
                <div><span className="font-semibold">Domain:</span> {customDomainInfo.customDomain}</div>
                <div><span className="font-semibold">Status:</span> {customDomainInfo.status}</div>
                {customDomainInfo.token && <div><span className="font-semibold">Verify Token:</span> {customDomainInfo.token}</div>}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-between pt-4">
        <button className="btn btn-ghost" disabled={step===0} onClick={back}>Back</button>
        <div className="flex gap-2">
          {step < steps.length -1 && <button className="btn btn-primary" onClick={next} disabled={saving}>{saving ? 'Saving...' : 'Next'}</button>}
          {step === steps.length -1 && <button className="btn btn-success" disabled={saving || !draft} onClick={async ()=> { if(!draft) return; try { const updated = await publish(draft._id); if(updated?.slug){ localStorage.setItem('site_updated', updated.slug); } } catch(e){ /* handled in hook */ } }}> {saving ? 'Publishing...' : draft?.status==='published' ? 'Published' : 'Publish'} </button>}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, ...rest }) => (
  <div className="form-control">
    <label className="label"><span className="label-text">{label}</span></label>
    <input {...rest} className="input input-bordered" />
  </div>
);

const ProgressBar = ({ step }) => (
  <ul className="steps w-full mb-4">
    {steps.map((s,i)=>(<li key={s} className={`step ${i<=step ? 'step-primary':''}`}>{s}</li>))}
  </ul>
);

export default InstitutionWizard;
