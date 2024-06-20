import { XMLParser } from 'fast-xml-parser';
import { readFile } from 'fs/promises';

import {
  JM_DICT_DIALECT,
  JM_DICT_FIELD,
  JM_DICT_KANJI_INFO,
  JM_DICT_MISC,
  JM_DICT_READING_INFO,
  JM_DICT_SENSE_POS,
  JmDict,
  JmDictEntry,
  JmDictGlossType,
  JmDictKanjiElement,
  JmDictLang,
  JmDictLangSourceType,
  JmDictReadingElement,
  JmDictSenseElement,
  JmDictSenseGloss,
  JmDictSenseLangSource,
} from './types';
import {
  XmlJmDictEntry,
  XmlJmDictGloss,
  XmlJmDictGlossType,
  XmlJmDictKanjiElement,
  XmlJmDictLSource,
  XmlJmDictLang,
  XmlJmDictLsType,
  XmlJmDictReadingElement,
  XmlJmDictSense,
  XmlJmDictXml,
} from './xml-types';
import { JMDICT_ENT_SEQ } from './constants';

/**
 * Take a JMdict or JMdict_e XML file and return a JmDict object
 * Updated up to the Rev 1.09 of the JMdict format
 */
export async function parseJmDictXml(
  xmlFilePath: string,
  asData?: boolean
): Promise<JmDict> {
  const xmlBuffer = asData ? xmlFilePath : await readFile(xmlFilePath);

  const parser = new XMLParser({
    allowBooleanAttributes: true,
    ignoreAttributes: false,
  });
  const xml = parser.parse(xmlBuffer);
  if (!isJmDictXml(xml)) {
    throw new Error(`Data provided is not a valid JMdict XML file`);
  }

  const entries = elemToArray(xml.JMdict.entry).map(transformXmlEntry);
  entries.sort((a, b) => a.entSeq - b.entSeq);

  return {
    creationDate: getCreationDate(entries),
    entries,
  };
}

function getCreationDate(entries: JmDictEntry[]): string | undefined {
  try {
    const jmDictEntry = entries.find(({ entSeq }) => entSeq === JMDICT_ENT_SEQ);
    const match = /\d{4}-\d{2}-\d{2}/.exec(
      jmDictEntry!.senses[0]!.gloss![0].text!
    );
    return match![0];
  } catch {
    return undefined;
  }
}

function isJmDictXml(xml: unknown): xml is XmlJmDictXml {
  try {
    return typeof (xml as XmlJmDictXml).JMdict.entry === 'object';
  } catch {
    return false;
  }
}

function transformXmlEntry(data: XmlJmDictEntry): JmDictEntry {
  const entry: JmDictEntry = {
    entSeq: data.ent_seq,
    readings: elemToArray(data.r_ele).map(transformXmlReading),
    senses: elemToArray(data.sense).map(transformXmlSense),
  };

  if (data.k_ele) {
    entry.kanjis = elemToArray(data.k_ele).map(transformXmlKanji);
  }

  return entry;
}

function transformXmlKanji(data: XmlJmDictKanjiElement): JmDictKanjiElement {
  const kanji: JmDictKanjiElement = {
    kEle: data.keb,
  };

  if (data.ke_inf) {
    kanji.info = elemToArray(data.ke_inf).map((info) =>
      getValueKey(JM_DICT_KANJI_INFO, info)
    );
  }

  if (data.ke_pri) {
    kanji.pri = elemToArray(data.ke_pri);
  }

  return kanji;
}

function transformXmlReading(
  data: XmlJmDictReadingElement
): JmDictReadingElement {
  const reading: JmDictReadingElement = {
    rEle: data.reb,
  };

  if (data.re_nokanji !== undefined) {
    reading.noKanji = true;
  }

  if (data.re_restr) {
    reading.restr = elemToArray(data.re_restr);
  }

  if (data.re_inf) {
    reading.info = elemToArray(data.re_inf).map((info) =>
      getValueKey(JM_DICT_READING_INFO, info)
    );
  }

  if (data.re_pri) {
    reading.pri = elemToArray(data.re_pri);
  }

  return reading;
}

function transformXmlSense(data: XmlJmDictSense): JmDictSenseElement {
  const sense: JmDictSenseElement = {};

  if (data.stagk) {
    sense.stagk = elemToArray(data.stagk);
  }

  if (data.stagr) {
    sense.stagr = elemToArray(data.stagr);
  }

  if (data.pos) {
    sense.pos = elemToArray(data.pos).map((pos) =>
      getValueKey(JM_DICT_SENSE_POS, pos)
    );
  }

  if (data.xref) {
    sense.xrefs = elemToArray(data.xref);
  }

  if (data.ant) {
    sense.ant = elemToArray(data.ant);
  }

  if (data.field) {
    sense.fields = elemToArray(data.field).map((field) =>
      getValueKey(JM_DICT_FIELD, field)
    );
  }

  if (data.misc) {
    sense.misc = elemToArray(data.misc).map((misc) =>
      getValueKey(JM_DICT_MISC, misc)
    );
  }

  // removed on 1.08 (?)
  // if (data.s_inf) {
  //   sense.info = data.s_inf;
  // }

  if (data.dial) {
    sense.dialect = elemToArray(data.dial).map((dial) =>
      getValueKey(JM_DICT_DIALECT, dial)
    );
  }

  if (data.lsource) {
    sense.langSources = elemToArray(data.lsource).map(transformXmlLsource);
  }

  if (data.gloss) {
    sense.gloss = elemToArray(data.gloss).map(transformXmlGloss);
  }

  // removed on 1.08 (?)
  // if (data.example) {
  //   sense.example = elemToArray(data.example);
  // }

  return sense;
}

function transformXmlLsource(data: XmlJmDictLSource): JmDictSenseLangSource {
  const lsource: JmDictSenseLangSource = {
    lang: transformXmlLang(getAttr(data, '@_lang') || 'eng'),
  };

  const text = getText(data);
  if (text) {
    lsource.text = text;
  }

  const type = getAttr(data, '@_ls_type');
  if (type) {
    lsource.type = transformXmlLsType(type);
  }

  if (getAttr(data, '@_ls_wasei') === 'y') {
    lsource.wasei = true;
  }

  return lsource;
}

function transformXmlGloss(data: XmlJmDictGloss): JmDictSenseGloss {
  const gloss: JmDictSenseGloss = {
    lang: transformXmlLang(getAttr(data, '@_xml:lang') || 'eng'),
  };

  const text = getText(data);
  if (text) {
    gloss.text = text;
  }

  const type = getAttr(data, '@_g_type');
  if (type) {
    gloss.type = transformXmlGlossType(type);
  }

  return gloss;
}

function transformXmlLang(data: XmlJmDictLang): JmDictLang {
  return data as JmDictLang;
}

function transformXmlGlossType(data: XmlJmDictGlossType): JmDictGlossType {
  return data;
}

function transformXmlLsType(data: XmlJmDictLsType): JmDictLangSourceType {
  return data as JmDictLangSourceType;
}

function getValueKey<K extends string, V>(obj: Record<K, V>, value: V): K {
  return Object.keys(obj).find((key) => obj[key as K] === value) as K;
}

function getText<T extends { '#text'?: string }>(
  node: string | T
): string | undefined {
  return typeof node === 'string' ? node : node['#text'];
}

function getAttr<A extends string, N extends { [attr in A]?: string }>(
  node: string | N,
  attr: A
): N[A] | undefined {
  if (typeof node === 'string') return undefined;
  return node[attr];
}

/**
 * This is exported in lib/utils but nx is beautiful and a library can't
 * import from another library T_T
 */
function elemToArray<T>(elem: T | T[]): T[] {
  return Array.isArray(elem) ? elem : [elem];
}
