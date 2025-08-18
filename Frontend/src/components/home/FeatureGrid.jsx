import React from 'react';
import { ShieldCheckIcon, RocketLaunchIcon, Squares2X2Icon, UserGroupIcon, ArrowTrendingUpIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Website Builder',
  desc: 'Drag‑and‑drop sections, ready-made themes, and instant publish.',
    icon: Squares2X2Icon,
  },
  {
    title: 'Student Management',
  desc: 'Import students, assign roll numbers, manage classes and batches.',
    icon: UserGroupIcon,
  },
  {
  title: 'Secure Login',
  desc: 'Private student and admin access with industry‑standard protection.',
    icon: ShieldCheckIcon,
  },
  {
  title: 'Online Payments',
  desc: 'Collect fees online with invoices and receipts.',
    icon: ArrowTrendingUpIcon,
  },
  {
  title: 'Go Live Fast',
  desc: 'From plan to a live site in minutes, not weeks.',
    icon: RocketLaunchIcon,
  },
  {
    title: 'Admin Tools',
  desc: 'Bulk import, plan controls, and capacity insights.',
    icon: WrenchScrewdriverIcon,
  },
];

export default function FeatureGrid(){
  return (
    <section className="bg-[#0D1526] text-gray-100 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Everything you need, built‑in</h2>
          <p className="mt-3 text-gray-300">Modern tools for institutions, from site building to student operations.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f)=> (
            <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/7.5 transition">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-indigo-600/20 ring-1 ring-indigo-500/30 grid place-items-center">
                  <f.icon className="h-6 w-6 text-indigo-300" />
                </div>
                <div className="text-white font-semibold">{f.title}</div>
              </div>
              <p className="mt-3 text-sm text-gray-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
