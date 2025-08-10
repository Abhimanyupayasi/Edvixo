import React, { useState } from 'react';
import ImageUploader from './ImageUploader';

// Simple editor for the fixed set of pages requested
// Pages: home (hero), about, courses, student-login, staff-login, contact

const ensurePage = (pages, key, template) => {
  let p = pages.find(p=>p.key===key);
  if(!p){ p = { key, title: template.title, sections: template.sections }; pages.push(p); }
  return p;
};

const templates = {
  home: { title:'Home', sections:[{ type:'hero', data:{ headline:'Welcome', subheadline:'Your success starts here', heroImageUrl:'' } }] },
  about: { title:'About Us', sections:[{ type:'about', data:{ content:'Add information about your institution.', image:'' } }] },
  courses: { title:'Courses', sections:[{ type:'courses', data:{ items:[] } }] },
  'student-login': { title:'Student Login', sections:[{ type:'login-info', data:{ context:'student', instructions:'Student portal coming soon.', portalUrl:'' } }] },
  'staff-login': { title:'Staff Login', sections:[{ type:'login-info', data:{ context:'staff', instructions:'Staff portal coming soon.', portalUrl:'' } }] },
  contact: { title:'Contact Us', sections:[{ type:'contact', data:{ address:'', phone:'', email:'' } }] }
};

export default function SitePagesEditor({ value, onChange }){
  const [active, setActive] = useState('home');
  const pages = JSON.parse(JSON.stringify(value||[]));

  const updatePages = () => onChange(pages);
  const current = ensurePage(pages, active, templates[active]);
  const section = current.sections[0];

  const update = (path, val) => {
    const parts = path.split('.');
    let ref = section;
    for(let i=0;i<parts.length-1;i++){ ref = ref[parts[i]]; }
    ref[parts[parts.length-1]] = val;
    updatePages();
  };

  const addCourse = () => {
    section.data.items.push({ title:'New Course', description:'Description', duration:'', image:'' });
    updatePages();
  };

  return (
    <div className="border rounded bg-base-100">
      <div className="flex border-b overflow-x-auto">
        {Object.keys(templates).map(k=> (
          <button key={k} onClick={()=>setActive(k)} className={`px-4 py-2 text-sm ${active===k? 'bg-primary text-primary-content':'hover:bg-base-200'}`}>{templates[k].title}</button>
        ))}
      </div>
      <div className="p-4 space-y-4 text-sm">
        {section.type==='hero' && (
          <div className="grid md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text font-medium">Headline</span>
              <input className="input input-bordered input-sm" value={section.data.headline} onChange={e=>update('data.headline', e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Subheadline</span>
              <input className="input input-bordered input-sm" value={section.data.subheadline} onChange={e=>update('data.subheadline', e.target.value)} />
            </label>
            <div className="md:col-span-2">
              <ImageUploader label="Hero Image" value={section.data.heroImageUrl} onChange={val=>update('data.heroImageUrl', val)} aspectHint="16:9" />
            </div>
          </div>
        )}
        {section.type==='about' && (
          <div className="space-y-3">
            <label className="form-control">
              <span className="label-text font-medium">About Content</span>
              <textarea className="textarea textarea-bordered h-40" value={section.data.content} onChange={e=>update('data.content', e.target.value)} />
            </label>
            <ImageUploader label="About Image" value={section.data.image} onChange={val=>update('data.image', val)} aspectHint="4:3" />
          </div>
        )}
        {section.type==='courses' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold">Courses ({section.data.items.length})</h4>
              <button className="btn btn-xs btn-primary" onClick={addCourse}>Add Course</button>
            </div>
            <div className="space-y-3">
              {section.data.items.map((c,i)=>(
                <div key={i} className="p-3 border rounded space-y-2">
                  <div className="flex gap-2">
                    <input className="input input-bordered input-xs flex-1" value={c.title} onChange={e=>{ c.title=e.target.value; updatePages(); }} placeholder="Title" />
                    <input className="input input-bordered input-xs w-32" value={c.duration} onChange={e=>{ c.duration=e.target.value; updatePages(); }} placeholder="Duration" />
                  </div>
                  <textarea className="textarea textarea-bordered textarea-xs w-full" value={c.description} onChange={e=>{ c.description=e.target.value; updatePages(); }} placeholder="Description" />
                  <input className="input input-bordered input-xs w-full" value={c.image} onChange={e=>{ c.image=e.target.value; updatePages(); }} placeholder="Image URL (optional)" />
                  <div className="text-right">
                    <button className="btn btn-ghost btn-xs" onClick={()=>{ section.data.items.splice(i,1); updatePages(); }}>Remove</button>
                  </div>
                </div>
              ))}
              {!section.data.items.length && <div className="text-xs opacity-60">No courses yet. Add one.</div>}
            </div>
          </div>
        )}
        {section.type==='login-info' && (
          <div className="grid md:grid-cols-2 gap-4">
            <label className="form-control">
              <span className="label-text font-medium">Instructions</span>
              <input className="input input-bordered input-sm" value={section.data.instructions} onChange={e=>update('data.instructions', e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Portal URL</span>
              <input className="input input-bordered input-sm" value={section.data.portalUrl} onChange={e=>update('data.portalUrl', e.target.value)} placeholder="https://portal.example.com" />
            </label>
          </div>
        )}
        {section.type==='contact' && (
          <div className="grid md:grid-cols-3 gap-4">
            <label className="form-control">
              <span className="label-text font-medium">Address</span>
              <input className="input input-bordered input-sm" value={section.data.address} onChange={e=>update('data.address', e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Phone</span>
              <input className="input input-bordered input-sm" value={section.data.phone} onChange={e=>update('data.phone', e.target.value)} />
            </label>
            <label className="form-control">
              <span className="label-text font-medium">Email</span>
              <input className="input input-bordered input-sm" value={section.data.email} onChange={e=>update('data.email', e.target.value)} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
