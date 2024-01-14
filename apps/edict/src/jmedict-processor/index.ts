/**
 * Reads and transforms XML files with the JMDict format to the needed
 * format for our app
 *
 * https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
 */
export class JMDictProcessor {
  public constructor() {}

  public async index(xmlFilePath: string): Promise<void> {
    console.log(`Reading ${xmlFilePath}...`);
  }

  public async write(outFilePath: string): Promise<void> {
    console.log(`Writing ${outFilePath}...`);
  }
}
