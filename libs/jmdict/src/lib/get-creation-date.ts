import { readFile } from 'fs/promises';

/**
 * Get the creation date of the XML without having to parse it
 */
export async function getCreationDate(
  xmlFilePath: string,
  asData?: boolean
): Promise<string | undefined> {
  const xml = asData ? xmlFilePath : (await readFile(xmlFilePath)).toString();

  // find it in the comments (as it appears in the top of the file)
  const match = /<!-- JMdict created: (\d{4}-\d{2}-\d{2}) -->/.exec(xml);
  if (match) return match[1];

  // find it in the gloss
  return /Creation Date: (\d{4}-\d{2}-\d{2})<\/gloss>/.exec(xml)?.[1];
}
