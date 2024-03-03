import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { basename } from 'path';

import { getCreationDate } from '@jmdict/get-creation-date';
import { parseJmDictXml } from '@jmdict/parse-jmdict-xml';
import { JmDict } from '@jmdict/types';

import { getCachePath } from './get-cache-path';

export async function loadJmDictXml(xmlFilePath: string): Promise<JmDict> {
  const xmlStringData = (await readFile(xmlFilePath)).toString();
  const creationDate = await getCreationDate(xmlStringData, true);
  let jmDict: JmDict;

  if (!creationDate) {
    throw new Error(`Couldn't find the creation date in "${xmlFilePath}`);
  }

  const xmlCachePath = getCachePath(creationDate, `jmdict.json`);

  if (existsSync(xmlCachePath)) {
    console.log(` - Loading json cached from ${basename(xmlCachePath)}`);
    jmDict = JSON.parse((await readFile(xmlCachePath)).toString()) as JmDict;
  } else {
    console.log(` - Parsing XML from ${basename(xmlFilePath)}`);
    jmDict = await parseJmDictXml(xmlStringData, true);

    console.log(` - Writing json cache into ${basename(xmlCachePath)}`);
    await writeFile(xmlCachePath, JSON.stringify(jmDict, null, 2));
  }

  return jmDict;
}
