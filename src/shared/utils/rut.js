/** Utilidades de RUT chileno: limpieza, formato con puntos/guion y validación de dígito verificador. */

export function cleanRut(value) {
  return value.replace(/[^0-9kK]/g, '').toUpperCase().slice(0, 9);
}

/** "184215973" -> "18.421.597-3" (el guion y los puntos se agregan solos) */
export function formatRut(clean) {
  if (clean.length <= 1) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withDots}-${dv}`;
}

export function computeDv(body) {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  if (res === 11) return '0';
  if (res === 10) return 'K';
  return String(res);
}

export function validateRut(clean) {
  if (clean.length < 8) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeDv(body) === dv;
}
