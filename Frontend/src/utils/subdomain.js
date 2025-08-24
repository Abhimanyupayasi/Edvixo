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

    const url = new URL(window.location.href);
    const alreadyOnPublic = url.pathname.startsWith('/public-site') && url.searchParams.get('site') === site;
    if (alreadyOnPublic) return;

    const nextPath = url.pathname + (url.search || '') + (url.hash || '');
    url.pathname = '/public-site';
    url.search = '';
    url.searchParams.set('site', site);
    if (nextPath && nextPath !== '/' && nextPath !== '/public-site') {
      url.searchParams.set('next', nextPath);
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // no-op
  }
}
