import { readFileSync, writeFileSync } from 'fs';
import { formatTime, formatNumber, formatSize } from './format';
import { basename } from 'path';

/**
 * Remove duplicate lines from the given file
 * - Reads the whole file
 * - Compares every line as string
 * - Writes the whole file with unique lines preserving the order as they
 *   first appear
 */
export function removeDuplicatedLinesInFile(filepath: string): void {
  const r0 = Date.now();
  const raw = readFileSync(filepath).toString();
  const lines = raw.split('\n');
  const readTime = Date.now() - r0;

  const f0 = Date.now();
  const unique: string[] = [];
  const appearedLines = new Set<string>();
  for (const line of lines) {
    // it's much faster checking in a Set than an array even if that means
    // duplicating the used memory
    if (appearedLines.has(line)) continue;
    appearedLines.add(line);
    unique.push(line);
  }
  const filterTime = Date.now() - f0;

  const w0 = Date.now();
  const res = unique.join('\n');
  writeFileSync(filepath, res);
  const writeTime = Date.now() - w0;

  console.log(
    `    - ${
      lines.length - unique.length
    } repeated lines removed from ${basename(filepath)}`
  );
  console.log(`      - Read time: ${formatTime(readTime)}`);
  console.log(`      - Filter time: ${formatTime(filterTime)}`);
  console.log(`      - Write time: ${formatTime(writeTime)}`);
  console.log(
    `      - Size change: ${formatNumber(lines.length)} lines (${formatSize(
      raw.length
    )}) => ${formatNumber(unique.length)} lines (${formatSize(res.length)})`
  );
}
