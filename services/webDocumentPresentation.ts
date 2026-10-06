function ensureMeta(name: string, content: string): void {
  if (typeof document === 'undefined') return;
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Syncs the web document chrome with the active theme (ported from
 * quiniela-native, minus its mobile-web specifics). No-ops outside web.
 */
export function syncWebDocumentPresentation(backgroundColor: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
  ensureMeta('theme-color', backgroundColor);
}
