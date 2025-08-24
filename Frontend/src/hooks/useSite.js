export default function useSite() {
  try {
    const url = new URL(window.location.href);
    const site = url.searchParams.get('site');
    if (site) return site;
  } catch {}
  try {
    const root = import.meta.env.VITE_ROOT_DOMAIN || 'abhimanyu.tech';
    const host = window.location.host.toLowerCase();
    const m = host.match(new RegExp(`^([^.]+)\\.${root.replace('.', '\\.')}$`));
    return m && m[1] !== 'www' ? m[1] : null;
  } catch {
    return null;
  }
}
