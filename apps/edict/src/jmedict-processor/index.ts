import { XMLParser } from 'fast-xml-parser';
import { existsSync, readFileSync, writeFileSync } from 'fs';

import { isFullHiragana } from '@utils/jp';
import { elemToArray } from '@utils/elem-to-array';
import {
  XmlJmDictEntry,
  XmlJmDictReadingElement,
  XmlJmDictSense,
  XmlJmDictSensePos,
  XmlJmDictXml,
} from '@jmdict/xml-types';

interface MetaData {
  /** Date when the JMdict XML was created */
  dataTime?: string;
  /** Date when the XML file was indexed */
  processedOn?: string;
  /** ms. taken to read and parse the JSON if provided */
  jsonReadTime?: number;
  /** ms. taken to write the cached json */
  jsonWriteTime?: number;
  /** ms. taken to read (open the Buffer) for the XML file */
  xmlReadTime?: number;
  /** ms. taken to parse the XML when provided */
  xmlParseTime?: number;
  /** ms. taken to index the data */
  indexTime?: number;
  /** ms. taken to write the output data */
  outWriteTime?: number;
  /** Number of discarded entries */
  wordsDiscarded: number;
  /** Number of indexed entries */
  wordsIndexed: number;
}

interface EntryFilter {
  acceptedPos: XmlJmDictSensePos[];
  kanaMinLength: number;
  kanaMaxLength: number;
}

interface IndexData {
  /** List of available kanas (hiragana/katakana) */
  kanas: string[];
  /**
   * Key1: Length of the word
   * Key2: Every kana in the word, but ordered
   * Value: List of words that can be written with that kanas
   */
  wordsByKana: Record<number, Record<string, string[]>>;
}

/**
 * Reads and transforms XML files with the JMDict format to the needed
 * format for our app
 *
 * https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project
 */
export class JMDictProcessor {
  private xml?: XmlJmDictXml;
  private meta: MetaData = {
    wordsDiscarded: 0,
    wordsIndexed: 0,
  };
  private indexData: IndexData = {
    kanas: [],
    wordsByKana: {},
  };

  private entryFilter: EntryFilter = {
    kanaMaxLength: 5,
    kanaMinLength: 2,
    acceptedPos: [
      // noun
      'noun (common) (futsuumeishi)',
      // verbs
      'Ichidan verb',
      'Ichidan verb - kureru special class',
      "Nidan verb with 'u' ending (archaic)",
      "Nidan verb (upper class) with 'bu' ending (archaic)",
      "Nidan verb (lower class) with 'bu' ending (archaic)",
      "Nidan verb (upper class) with 'dzu' ending (archaic)",
      "Nidan verb (lower class) with 'dzu' ending (archaic)",
      "Nidan verb (upper class) with 'gu' ending (archaic)",
      "Nidan verb (lower class) with 'gu' ending (archaic)",
      "Nidan verb (upper class) with 'hu/fu' ending (archaic)",
      "Nidan verb (lower class) with 'hu/fu' ending (archaic)",
      "Nidan verb (upper class) with 'ku' ending (archaic)",
      "Nidan verb (lower class) with 'ku' ending (archaic)",
      "Nidan verb (upper class) with 'mu' ending (archaic)",
      "Nidan verb (lower class) with 'mu' ending (archaic)",
      "Nidan verb (lower class) with 'nu' ending (archaic)",
      "Nidan verb (upper class) with 'ru' ending (archaic)",
      "Nidan verb (lower class) with 'ru' ending (archaic)",
      "Nidan verb (lower class) with 'su' ending (archaic)",
      "Nidan verb (upper class) with 'tsu' ending (archaic)",
      "Nidan verb (lower class) with 'tsu' ending (archaic)",
      "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)",
      "Nidan verb (upper class) with 'yu' ending (archaic)",
      "Nidan verb (lower class) with 'yu' ending (archaic)",
      "Nidan verb (lower class) with 'zu' ending (archaic)",
      "Yodan verb with 'bu' ending (archaic)",
      "Yodan verb with 'gu' ending (archaic)",
      "Yodan verb with 'hu/fu' ending (archaic)",
      "Yodan verb with 'ku' ending (archaic)",
      "Yodan verb with 'mu' ending (archaic)",
      "Yodan verb with 'nu' ending (archaic)",
      "Yodan verb with 'ru' ending (archaic)",
      "Yodan verb with 'su' ending (archaic)",
      "Yodan verb with 'tsu' ending (archaic)",
      'Godan verb - -aru special class',
      "Godan verb with 'bu' ending",
      "Godan verb with 'gu' ending",
      "Godan verb with 'ku' ending",
      'Godan verb - Iku/Yuku special class',
      "Godan verb with 'mu' ending",
      "Godan verb with 'nu' ending",
      "Godan verb with 'ru' ending",
      "Godan verb with 'ru' ending (irregular verb)",
      "Godan verb with 'su' ending",
      "Godan verb with 'tsu' ending",
      "Godan verb with 'u' ending",
      "Godan verb with 'u' ending (special class)",
      'Godan verb - Uru old class verb (old form of Eru)',
      'intransitive verb',
      'Kuru verb - special class',
      'irregular nu verb',
      'irregular ru verb, plain form ends with -ri',
      'noun or participle which takes the aux. verb suru',
      'su verb - precursor to the modern suru',
      'suru verb - included',
      'suru verb - special class',
      'transitive verb',
      'Ichidan verb - zuru verb (alternative form of -jiru verbs)',
    ],
  };

  public constructor(xmlCacheJsonPath?: string) {
    if (xmlCacheJsonPath && existsSync(xmlCacheJsonPath)) {
      console.log(`Reading cached json from "${xmlCacheJsonPath}"...`);
      const t0 = Date.now();
      const data = readFileSync(xmlCacheJsonPath).toString();
      this.xml = JSON.parse(data);
      const readTime = Date.now() - t0;
      this.meta.jsonReadTime = readTime;
      console.log(` - Read done in ${readTime} ms.`);
    }
  }

  public printMeta(): void {
    console.log(JSON.stringify(this.meta, null, 2));
  }

  public async index(xmlFilePath: string): Promise<void> {
    if (this.xml) {
      console.log('XML already parsed. Skipping.');
    } else {
      await this.parseXml(xmlFilePath);
    }

    console.log('Indexing data...');
    const t0 = Date.now();
    this.meta.processedOn = new Date().toISOString();
    this.meta.dataTime = this.getDataTime();
    this.doIndexing();
    this.indexData.kanas.sort();
    const indexTime = Date.now() - t0;
    console.log(` - Data indexed in ${indexTime} ms.`);
    this.meta.indexTime = indexTime;
  }

  public async writeJson(
    outFilePath: string,
    onlyIfXmlWasParsed = true
  ): Promise<void> {
    if (!JMDictProcessor.isXmlReady(this.xml)) return;

    if (!this.meta.xmlParseTime && onlyIfXmlWasParsed) {
      console.log(`Skipping writting json cache`);
      return;
    }

    console.log(`Writing ${outFilePath}...`);
    const t0 = Date.now();
    const data = JSON.stringify(this.xml, null, 2);
    writeFileSync(outFilePath, data);
    const ellapsed = Date.now() - t0;
    console.log(` - JSON written in ${ellapsed} ms.`);
    this.meta.jsonWriteTime = ellapsed;
  }

  public async writeOut(outFilePath: string, pretty?: boolean): Promise<void> {
    console.log(`Writing output to "${outFilePath}"...`);
    const t0 = Date.now();

    const data = {
      meta: this.meta,
      ...this.indexData,
    };
    const str = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
    writeFileSync(outFilePath, str);

    const ellapsed = Date.now() - t0;
    console.log(` - Output written in ${ellapsed} ms.`);
    this.meta.outWriteTime = ellapsed;
  }

  private static isXmlReady(
    xml: XmlJmDictXml | undefined
  ): xml is XmlJmDictXml {
    if (!xml) {
      throw new Error('XML needs to be read or parsed first');
    }
    return true;
  }

  private async parseXml(xmlFilePath: string): Promise<void> {
    console.log(`Reading XML from "${xmlFilePath}"...`);
    const t0 = Date.now();
    const xmlBuffer = readFileSync(xmlFilePath);
    const readTime = Date.now() - t0;
    console.log(` - XML file read in ${readTime} ms.`);
    this.meta.xmlReadTime = readTime;

    console.log('Parsing XML...');
    const t1 = Date.now();
    const parser = new XMLParser({
      allowBooleanAttributes: true,
      ignoreAttributes: false,
    });
    this.xml = parser.parse(xmlBuffer);
    const parseTime = Date.now() - t1;
    console.log(` - XML parsed in ${parseTime} ms.`);
    this.meta.xmlParseTime = parseTime;
  }

  private getDataTime(): string | undefined {
    if (!JMDictProcessor.isXmlReady(this.xml)) return;

    const entry = this.xml.JMdict.entry.find(
      (entry) => entry.ent_seq === 9999999
    );
    if (!entry) return;
    return /Creation Date: (\d{4}-\d{2}-\d{2})/.exec(
      (entry.sense as XmlJmDictSense).gloss as unknown as string
    )?.[1];
  }

  private doIndexing(): void {
    if (!JMDictProcessor.isXmlReady(this.xml)) return;

    this.xml.JMdict.entry.forEach((entry) => {
      this.acceptedWords(entry).forEach((word) => this.indexWord(word));
    });
  }

  private acceptedWords(entry: XmlJmDictEntry): string[] {
    const readings = elemToArray(entry.r_ele);

    if (!this.filterEntryBySense(entry)) {
      this.meta.wordsDiscarded += readings.length;
      return [];
    }

    return readings
      .filter((reading) => {
        if (
          !this.filterReadingByWellUsed(reading) ||
          !this.filterWordByKana(reading.reb)
        ) {
          this.meta.wordsDiscarded++;
          return false;
        }
        return true;
      })
      .map((reading) => reading.reb);
  }

  private filterEntryBySense(entry: XmlJmDictEntry): boolean {
    return elemToArray(entry.sense).some((sense) => {
      if (!sense.pos) return false;
      return elemToArray(sense.pos).some((elem) =>
        this.entryFilter.acceptedPos.includes(elem)
      );
    });
  }

  private filterReadingByWellUsed(reading: XmlJmDictReadingElement): boolean {
    return elemToArray(reading.re_pri).some((priority) =>
      priority?.startsWith('nf')
    );
  }

  private filterWordByKana(word: string): boolean {
    const { kanaMinLength, kanaMaxLength } = this.entryFilter;

    return (
      word.length >= kanaMinLength &&
      word.length <= kanaMaxLength &&
      isFullHiragana(word)
    );
  }

  private indexWord(word: string): void {
    this.meta.wordsIndexed++;

    const length = word.length;
    const kana = (() => {
      const arr = word.split('');
      arr.sort();
      return arr.join('');
    })();

    // add the indexed word
    let byLength = this.indexData.wordsByKana[length];
    if (!byLength) {
      byLength = {};
      this.indexData.wordsByKana[length] = byLength;
    }

    let byKana = byLength[kana];
    if (!byKana) {
      byKana = [];
      byLength[kana] = byKana;
    }

    if (!byKana.includes(word)) {
      byKana.push(word);
    }

    // add the indexed kanas
    for (const c of kana) {
      if (this.indexData.kanas.includes(c)) continue;
      this.indexData.kanas.push(c);
    }
  }
}
