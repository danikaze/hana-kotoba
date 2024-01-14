import { join } from 'path';
import { JMDictProcessor } from './jmedict-processor';

export async function run() {
  const XML_PATH = join(__dirname, 'assets', 'JMdict_e');
  const XML_CACHE_PATH = join(__dirname, 'assets', 'xml-cache.json');
  const OUT_PATH = join(__dirname, 'indexed-usable-words.json');

  const processor = new JMDictProcessor(XML_CACHE_PATH);
  await processor.index(XML_PATH);
  await processor.writeJson(XML_CACHE_PATH);
  await processor.writeOut(OUT_PATH);
  processor.printMeta();
}

run();
