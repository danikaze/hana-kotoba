import { existsSync } from 'fs';
import { mkdirpSync } from 'mkdirp';
import { join } from 'path';

export function getCachePath(filename?: string): string {
  const cacheFolder = join(__dirname, '..', '..', '.cache');

  if (!existsSync(cacheFolder)) {
    mkdirpSync(cacheFolder);
  }

  return filename ? join(cacheFolder, filename) : cacheFolder;
}
