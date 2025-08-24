export function getSubdomain(host, rootDomain) {
  if (!host || !rootDomain) return null;
  const H = host.toLowerCase();
  const R = rootDomain.toLowerCase();
  if (!H.endsWith(R)) return null;
  // strip ".rootDomain"
  let rest = H.slice(0, -R.length);
  if (rest.endsWith('.')) rest = rest.slice(0, -1);
  if (!rest) return null; // apex
  const parts = rest.split('.').filter(Boolean);
  const sub = parts[parts.length - 1];
  if (!sub || sub === 'www') return null;
  return sub;
}

export function maybeRedirectToSubsite() {
  try {
    const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'abhimanyu.tech';
    const host = window.location.host;
    // skip local dev
    if (/localhost|127\.0\.0\.1/.test(host)) return;

    const site = getSubdomain(host, rootDomain);
  if (!site) return;
  // Clean URL mode: when on a subdomain, don't change the path.
  // Routing will render PublicSite at "/" and nested paths.
  // We still expose the site for consumers that want it.
  window.__EDVIXO_SITE = site;
  } catch {
    // no-op
  }
}
