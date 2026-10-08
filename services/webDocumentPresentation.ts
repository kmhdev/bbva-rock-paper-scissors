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
 * Sincroniza el chrome del documento web con el tema activo (portado de
 * quiniela-native, sin sus detalles de móvil-web). No hace nada fuera de web.
 */
export function syncWebDocumentPresentation(backgroundColor: string): void {
  if (typeof document === 'undefined') return;
  document.documentElement.style.backgroundColor = backgroundColor;
  document.body.style.backgroundColor = backgroundColor;
  ensureMeta('theme-color', backgroundColor);
}
