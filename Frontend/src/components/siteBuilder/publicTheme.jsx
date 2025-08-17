import React from 'react';
import StudentLogin from './StudentLogin.jsx';
// Centralized public site architecture: palettes + structured sections
export const PageRegistry = {
  home: ({ sections, site }) => <HeroSection section={sections[0]} site={site} />,
  about: ({ sections }) => <AboutSection section={sections[0]} />,
  courses: ({ sections }) => <CoursesSection section={sections[0]} />,
  'student-login': ({ sections, site }) => (
    <SectionCard className="mb-16" id="student-login">
      <div className="space-y-4">
        <div className="font-bold text-2xl">Student Login</div>
        <div className="flex flex-wrap gap-3">
          <a className="btn btn-primary btn-sm" href={`?site=${site?.subdomain || ''}/student-login`}>Open Full Page</a>
          <a className="btn btn-outline btn-sm" href={`?site=${site?.subdomain || ''}/student-dashboard`}>Go to Dashboard</a>
        </div>
        <StudentLogin site={site} />
      </div>
    </SectionCard>
  ),
  'staff-login': ({ sections }) => <LoginInfoSection section={sections[0]} context="staff" />,
  contact: ({ sections }) => <ContactSection section={sections[0]} />
};

export const SectionCard = ({ children, className='' }) => (
  <section className={`relative rounded-2xl overflow-hidden shadow-sm border border-[var(--color-base-200)] bg-[var(--color-base-100)] ${className}`}>
    <div className="p-8 md:p-12">{children}</div>
  </section>
);

const GradientBar = () => <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,var(--color-primary),transparent),radial-gradient(circle_at_80%_30%,var(--color-accent),transparent)]" />;

const Badge = ({ children }) => <span className="inline-block text-[10px] tracking-wide uppercase font-semibold px-2 py-1 rounded bg-[var(--color-base-200)] text-[var(--color-neutral)]">{children}</span>;

export const HeroSection = ({ section, site }) => {
  const data = section?.data || {};
  return (
    <div className="relative w-full mb-16">
      <SectionCard className="bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)]">
        <GradientBar />
        <div className="relative flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <Badge>Welcome</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-[var(--color-primary)] drop-shadow-sm">{data.headline || site?.name}</h1>
            <p className="text-lg md:text-xl opacity-80 max-w-xl">{data.subheadline || site?.tagline}</p>
            <div className="flex gap-4 flex-wrap">
              <a href="#courses" className="btn btn-primary btn-md">Explore Courses</a>
              <a href="#contact" className="btn btn-outline btn-md">Contact Us</a>
            </div>
          </div>
          {data.heroImageUrl && (
            <div className="flex-1 max-w-xl">
              <img src={data.heroImageUrl} alt="Hero" className="rounded-2xl w-full object-cover shadow-lg border border-[var(--color-base-200)]" />
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export const AboutSection = ({ section }) => {
  const data = section?.data || {};
  return (
    <SectionCard className="mb-16">
      <GradientBar />
      <div className="relative space-y-6">
        <Badge>About</Badge>
        <h2 className="text-3xl font-bold">About Us</h2>
        <div className="prose max-w-none whitespace-pre-line leading-relaxed">{data.content || 'Add information about the institution.'}</div>
        {data.image && <img src={data.image} alt="About" className="rounded-xl max-h-72 object-cover border border-[var(--color-base-200)]" />}
      </div>
    </SectionCard>
  );
};

export const CoursesSection = ({ section }) => {
  const data = section?.data || { items:[] };
  return (
    <div id="courses" className="mb-16 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-3xl font-bold">Courses</h2>
        <Badge>{data.items?.length || 0} Offerings</Badge>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {(data.items||[]).map((c,i)=>(
          <div key={i} className="group relative rounded-xl border bg-[var(--color-base-100)] border-[var(--color-base-200)] p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            {c.image && <img src={c.image} alt={c.title} className="h-40 w-full object-cover rounded-lg border border-[var(--color-base-200)]" />}
            <h3 className="font-semibold text-lg text-[var(--color-primary)] group-hover:underline">{c.title}</h3>
            <p className="text-sm opacity-80 line-clamp-3">{c.description}</p>
            {c.duration && <span className="text-[11px] uppercase tracking-wide font-medium text-[var(--color-neutral)]">Duration: {c.duration}</span>}
          </div>
        ))}
        {!data.items?.length && <div className="opacity-60 text-sm">No courses added yet.</div>}
      </div>
    </div>
  );
};

export const LoginInfoSection = ({ section, context }) => {
  const data = section?.data || {};
  const label = context === 'staff' ? 'Staff Login' : 'Student Login';
  return (
    <SectionCard className="mb-16" id={context==='staff' ? 'staff-login':'student-login'}>
      <GradientBar />
      <div className="relative space-y-4">
        <Badge>{label}</Badge>
        <h2 className="text-2xl font-bold">{label}</h2>
        <p className="opacity-80">{data.instructions || 'Portal coming soon.'}</p>
        {data.portalUrl && <a href={data.portalUrl} target="_blank" className="btn btn-sm btn-primary w-fit">Go to Portal</a>}
      </div>
    </SectionCard>
  );
};

export const ContactSection = ({ section }) => {
  const d = section?.data || {};
  return (
    <SectionCard className="mb-16" id="contact">
      <GradientBar />
      <div className="relative space-y-4">
        <Badge>Contact</Badge>
        <h2 className="text-2xl font-bold">Get in Touch</h2>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div><p className="font-semibold mb-1">Address</p><p className="opacity-80 whitespace-pre-line">{d.address || '—'}</p></div>
          <div><p className="font-semibold mb-1">Phone</p><p className="opacity-80">{d.phone || '—'}</p></div>
          <div><p className="font-semibold mb-1">Email</p><p className="opacity-80">{d.email || '—'}</p></div>
        </div>
      </div>
    </SectionCard>
  );
};

export const applyPalette = (paletteColors={}) => Object.entries(paletteColors).reduce((acc,[k,v])=>{ acc[`--color-${k}`]=v; return acc; },{});
