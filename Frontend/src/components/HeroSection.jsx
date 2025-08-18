import React from "react";

function HeroSection() {
  return (
    <section className="bg-[#0B1220] text-gray-100 relative overflow-hidden">
      <div className="absolute -top-1/3 -right-1/3 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-1/3 -left-1/3 w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-3xl" />

      <div className="grid max-w-7xl px-6 py-20 mx-auto lg:gap-8 xl:gap-10 lg:grid-cols-12 items-center">
        <div className="mr-auto place-self-center lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs text-gray-300 mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> New: Student Portal & Public Site Builder
          </div>
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-tight md:text-5xl xl:text-6xl text-white">
            One platform to manage your institution and showcase it beautifully
          </h1>
          <p className="max-w-2xl mb-8 font-light text-gray-300 md:text-lg lg:text-xl">
            Build your public site, manage students, fees, and batches—all in a modern, secure dashboard. Students can log in to view their profile instantly.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/plans" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-500">
              View Pricing & Plans
              <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </a>
            <a href="/public-site/student-login" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-white border border-gray-600 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-700">
              Student Portal
            </a>
          </div>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-400">
            <div>
              <div className="text-white font-semibold">Website Builder</div>
              <div>Launch a branded site in minutes</div>
            </div>
            <div>
              <div className="text-white font-semibold">Student Management</div>
              <div>Import, enroll, and track progress</div>
            </div>
            <div>
              <div className="text-white font-semibold">Payments</div>
              <div>Integrated checkout and invoices</div>
            </div>
            <div>
              <div className="text-white font-semibold">Security</div>
              <div>Safe logins and protected data</div>
            </div>
          </div>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=1200&auto=format&fit=crop"
            alt="3D dashboard mockup"
            className="rounded-xl ring-1 ring-white/10 shadow-2xl shadow-indigo-900/20"
          />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
