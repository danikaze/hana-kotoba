export function formatTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  let s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;

  const fh = h > 0 ? `${h}h ` : '';
  const fm = m > 0 ? `${m.toString().padStart(h === 0 ? 1 : 2, '0')}m ` : '';
  const fs = `${s.toString().padStart(fm === '' ? 1 : 2, '0')}s`;
  const fms = fm === '' ? ` ${(ms % 1000).toString().padStart(3, '0')}ms` : '';

  return `${fh}${fm}${fs}${fms}`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}b`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}kb`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)}mb`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}
