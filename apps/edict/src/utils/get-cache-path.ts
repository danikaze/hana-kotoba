import { existsSync } from 'fs';
import { mkdirpSync } from 'mkdirp';
import { dirname, join } from 'path';

/**
 * Get a normalized path to a cache file
 */
export function getCachePath(...path: string[]): string {
  const fileName = join(__dirname, '..', '..', '.cache', ...path);
  const cacheFolder = dirname(fileName);

  if (!existsSync(cacheFolder)) {
    mkdirpSync(cacheFolder);
  }

  return fileName;
}
