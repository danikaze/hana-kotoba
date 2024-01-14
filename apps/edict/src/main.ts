import { join } from 'path';
import { JMDictProcessor } from './jmedict-processor';

export async function run() {
  const XML_PATH = join(__dirname, 'assets', 'JMdict_e');
  const OUTPUT_PATH = join(__dirname, 'out');

  const processor = new JMDictProcessor();
  await processor.index(XML_PATH);
  await processor.write(OUTPUT_PATH);
}

run();
