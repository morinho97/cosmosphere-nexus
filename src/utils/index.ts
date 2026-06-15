/**
 * Cosmosphere utilities — formatting, math, color helpers
 */

// ── Number formatting ────────────────────────────────────────────────────────

export function formatKm(km: number): string {
  if (km >= 1_000_000) return `${(km / 1_000_000).toFixed(2)} Mkm`;
  if (km >= 1_000) return `${(km / 1_000).toFixed(1)} Tkm`;
  return `${Math.round(km).toLocaleString()} km`;
}

export function formatSpeed(kms: number): string {
  return `${kms.toFixed(2)} km/s`;
}

export function formatDegrees(deg: number, axis: 'lat' | 'lng'): string {
  const abs = Math.abs(deg);
  const suffix = axis === 'lat' ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W');
  return `${abs.toFixed(4)}° ${suffix}`;
}

export function formatCountdown(target: Date): string {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return 'NOW';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function formatUtc(date: Date): string {
  return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}

// ── Orbital mechanics helpers ────────────────────────────────────────────────

/**
 * Classify orbital regime by altitude (km)
 */
export function classifyOrbit(altKm: number): string {
  if (altKm < 160) return 'Sub-orbital';
  if (altKm < 2_000) return 'LEO';
  if (altKm < 20_200) return 'MEO';
  if (altKm >= 35_786 - 200 && altKm <= 35_786 + 200) return 'GEO';
  if (altKm > 35_786) return 'HEO / GTO';
  return 'MEO';
}

/**
 * Orbital velocity from altitude (vis-viva, km/s)
 */
export function orbitalVelocity(altKm: number): number {
  const MU = 398_600.4418; // GM of Earth, km³/s²
  const R = 6_371;         // Earth radius, km
  return Math.sqrt(MU / (R + altKm));
}

/**
 * Orbital period in minutes from altitude
 */
export function orbitalPeriod(altKm: number): number {
  const R = 6_371;
  const a = R + altKm; // semi-major axis km
  const GM = 398_600.4418;
  return (2 * Math.PI * Math.sqrt(Math.pow(a, 3) / GM)) / 60;
}

/**
 * Haversine distance between two lat/lng points (km)
 */
export function haversineKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6_371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Maximum communication footprint radius (ground great-circle degrees)
 * given satellite altitude in km
 */
export function footprintRadius(altKm: number): number {
  const R = 6_371;
  return (Math.acos(R / (R + altKm)) * 180) / Math.PI;
}

// ── Color helpers ────────────────────────────────────────────────────────────

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t).toString(16).padStart(2, '0');
  const g = Math.round(ag + (bg - ag) * t).toString(16).padStart(2, '0');
  const bl = Math.round(ab + (bb - ab) * t).toString(16).padStart(2, '0');
  return `#${r}${g}${bl}`;
}

/**
 * Map a 0-1 probability to a severity color
 */
export function conjunctionColor(probability: number): string {
  if (probability > 0.01) return '#ff3d3d';   // critical
  if (probability > 0.001) return '#ff6b35';  // high
  if (probability > 0.0001) return '#F59E0B'; // medium
  return '#39FF14';                            // low
}

export function conjunctionSeverity(probability: number): 'critical' | 'high' | 'medium' | 'low' {
  if (probability > 0.01) return 'critical';
  if (probability > 0.001) return 'high';
  if (probability > 0.0001) return 'medium';
  return 'low';
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function addHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours * 3_600_000);
}

export function utcNow(): Date {
  return new Date();
}

export function formatRelativeTime(date: Date): string {
  const diffMs = date.getTime() - Date.now();
  const diffH = diffMs / 3_600_000;
  if (Math.abs(diffH) < 1) {
    const m = Math.round(Math.abs(diffMs) / 60_000);
    return diffMs > 0 ? `in ${m}m` : `${m}m ago`;
  }
  const h = Math.round(Math.abs(diffH));
  return diffMs > 0 ? `in ${h}h` : `${h}h ago`;
}
