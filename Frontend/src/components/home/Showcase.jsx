import React from 'react';

export default function Showcase(){
  return (
    <section className="bg-[#0B1220] text-gray-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="order-2 lg:order-1">
          <h3 className="text-2xl md:text-3xl font-bold text-white">Website Builder</h3>
          <p className="mt-3 text-gray-300">Pick a theme, customize sections, and publish to your subdomain. Connect a custom domain when ready.</p>
          <ul className="mt-5 space-y-2 text-sm text-gray-300 list-disc pl-5">
            <li>Prebuilt sections: hero, courses, contact, student login</li>
            <li>Automatic colors and typography from theme</li>
            <li>Fast publish with CDN caching</li>
          </ul>
          <a href="/my-plan/:planId/update-website" className="inline-flex mt-6 items-center justify-center px-5 py-2.5 text-sm font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500">Open Builder</a>
        </div>
        <div className="order-1 lg:order-2">
          <img src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" alt="Website builder UI" className="rounded-xl ring-1 ring-white/10 shadow-2xl shadow-indigo-900/20" />
          <div className="text-xs text-gray-400 mt-2">Replace this with your Iconscout/Icon8 3D UI illustration for best results.</div>
        </div>
      </div>
    </section>
  );
}
