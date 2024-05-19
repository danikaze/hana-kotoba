import { seedJmDict } from '@jmdict/seed';
import { join } from 'path';
import { loadJmDictXml } from './utils/load-jmdict-xml';

const XML_PATH = join(__dirname, 'assets', 'JMdict_e');

export async function run() {
  const xml = await loadJmDictXml(XML_PATH);
  await seedJmDict({ xml });
}

run();
