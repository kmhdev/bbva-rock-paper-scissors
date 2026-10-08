import type { User } from '@supabase/supabase-js';

/**
 * Sugiere un nombre inicial para el reclamo a partir de los metadatos
 * de Google (full_name, name, preferred_username) o del prefijo del
 * email. El usuario siempre puede editarlo antes de reservar.
 */
export function getGoogleNameSuggestion(user: User | null): string {
  if (!user) return '';
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.preferred_username,
    metadata.nickname,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length >= 2) {
      return candidate.trim().slice(0, 20);
    }
  }
  const prefix = typeof user.email === 'string' ? (user.email.split('@')[0] ?? '') : '';
  const clean = prefix.trim().slice(0, 20);
  return clean.length >= 2 ? clean : '';
}
