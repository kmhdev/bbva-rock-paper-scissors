/** Validación del nombre público (portada de espanografia UsernameSetup). */
export function validateUsername(username: string): string {
  const clean = username.trim();
  if (clean.length < 2 || clean.length > 20) {
    return 'Usa entre 2 y 20 caracteres.';
  }
  return '';
}
