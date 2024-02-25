import { PrismaClient } from '@prisma/client';
import { Args } from '@prisma/client/runtime/library';
import { JmDictModel } from '../jm-dict-model';
import {
  JmDict,
  JmDictDialect,
  JmDictEntry,
  JmDictKanjiElement,
  JmDictKanjiInfo,
  JmDictLang,
  JmDictRePri,
  JmDictReadingElement,
  JmDictReadingInfo,
  JmDictSenseElement,
  JmDictSenseField,
  JmDictSenseGloss,
  JmDictSenseLangSource,
  JmDictSenseMisc,
  JmDictSensePos,
} from '../types';

export async function seedJmDictEntries(
  prisma: PrismaClient,
  { entries }: JmDict
): Promise<void> {
  console.log(' - Seeding Entries:');
  const model = new JmDictModel(prisma);
  const lastEntry = await model.getHighestEntrySeq();
  const lastEntryIndex = entries.findIndex(
    (entry) => entry.entSeq === lastEntry
  );
  const startIndex = lastEntryIndex === -1 ? 0 : lastEntryIndex + 1;

  const startTime = Date.now();
  for (let i = startIndex; i < entries.length; i++) {
    const progress = getProgress(startIndex, i, entries.length, startTime);

    const entry = entries[i];
    const readings = entry.readings.map((reading) => reading.rEle).join(', ');
    console.log(
      `   - Creating entry ${entry.entSeq} (${readings}) | ${i + 1}/${
        entries.length
      } (${progress})...`
      // '>>>',
      // JSON.stringify(entry, null, 2)
    );
    await createEntry(prisma, entry);
  }
}

export async function clearJmDictEntries(prisma: PrismaClient): Promise<void> {
  console.log(' - Clearing entries...');
  prisma.jmDictEntry.deleteMany({});
}

function getProgress(
  start: number,
  current: number,
  total: number,
  startTime: number
): string {
  const finished = current - start;
  const pctg = ((100 * current) / total).toFixed(0) + '%';
  if (!finished) return pctg;

  const remaining = total - current;
  const entriesPerSecond = (1000 * finished) / (Date.now() - startTime);
  let s = Math.ceil(remaining / entriesPerSecond);

  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;

  const fh = h > 0 ? `${h}h ` : '';
  const fm = `${m.toString().padStart(2, '0')}m `;
  const fs = `${s.toString().padStart(2, '0')}s`;

  return `${pctg} - ${fh}${fm}${fs}`;
}

async function createEntry(
  prisma: PrismaClient,
  entry: JmDictEntry
): Promise<void> {
  const data = getEntry(entry);
  // console.log('~~~>', JSON.stringify(data, null, 2));
  await prisma.jmDictEntry.create({ data });
}

type EntryCreateData = Omit<
  Args<PrismaClient['jmDictEntry'], 'create'>['data'],
  'entryId'
>;
function getEntry(entry: JmDictEntry): EntryCreateData {
  const data: EntryCreateData = {
    entSeq: entry.entSeq,
    readings: {
      create: entry.readings.map(getReading),
    },
  };

  if (entry.kanjis) {
    data.kanjis = { create: entry.kanjis.map(getKanji) };
  }

  if (entry.senses) {
    data.senses = { create: entry.senses.map(getSense) };
  }

  return data;
}

type ReadingCreateData = Omit<
  Args<PrismaClient['jmDictReading'], 'create'>['data'],
  'entryId'
>;
function getReading(reading: JmDictReadingElement): ReadingCreateData {
  const data: ReadingCreateData = {
    reading: reading.rEle,
  };

  if (reading.info) {
    data.infos = {
      create: reading.info.map(getReadingInfo),
    } as ReadingCreateData['infos'];
  }

  if (reading.pri) {
    data.priorities = {
      create: reading.pri.map(getReadingPri),
    } as ReadingCreateData['priorities'];
  }

  return data;
}

type ReadingInfoCreateData = Omit<
  Args<PrismaClient['jmDictReadingInfoOnJmDictReading'], 'create'>['data'],
  'jmDictReadingId'
>;
function getReadingInfo(info: JmDictReadingInfo): ReadingInfoCreateData {
  const data: ReadingInfoCreateData = {
    jmDictReadingInfoId: info,
  };

  return data;
}

type PriOnReadingCreateData = Omit<
  Args<PrismaClient['jmDictPrioritiesOnJmDictReading'], 'create'>['data'],
  'jmDictReadingId'
>;
function getReadingPri(pri: JmDictRePri): PriOnReadingCreateData {
  const data: PriOnReadingCreateData = {
    jmDictPriorityId: pri,
  };

  return data;
}

type KanjiCreateData = Omit<
  Args<PrismaClient['jmDictKanji'], 'create'>['data'],
  'entryId'
>;
function getKanji(kanji: JmDictKanjiElement): KanjiCreateData {
  const data: KanjiCreateData = {
    kanji: kanji.kEle,
  };

  if (kanji.info) {
    data.infos = {
      create: kanji.info.map(getKanjiInfo),
    } as KanjiCreateData['infos'];
  }

  if (kanji.pri) {
    data.priorities = {
      create: kanji.pri.map(getKanjiPri),
    } as KanjiCreateData['priorities'];
  }

  return data;
}

type KanjiInfoCreateData = Omit<
  Args<PrismaClient['jmDictKanjiInfoOnJmDictKanji'], 'create'>['data'],
  'jmDictKanjiId'
>;
function getKanjiInfo(info: JmDictKanjiInfo): KanjiInfoCreateData {
  const data: KanjiInfoCreateData = {
    jmDictKanjiInfoId: info,
  };

  return data;
}

type PriOnKanjiCreateData = Omit<
  Args<PrismaClient['jmDictPrioritiesOnJmDictKanji'], 'create'>['data'],
  'jmDictKanjiId'
>;
function getKanjiPri(pri: JmDictRePri): PriOnKanjiCreateData {
  const data: PriOnKanjiCreateData = {
    jmDictPriorityId: pri,
  };

  return data;
}

type SenseCreateData = Omit<
  Args<PrismaClient['jmDictSense'], 'create'>['data'],
  'entryId'
>;
function getSense(sense: JmDictSenseElement): SenseCreateData {
  const data: SenseCreateData = {};

  if (sense.misc) {
    data.miscs = {
      create: sense.misc.map(getMisc),
    } as SenseCreateData['miscs'];
  }

  if (sense.dialect) {
    data.dialects = {
      create: sense.dialect.map(getDialect),
    } as SenseCreateData['dialects'];
  }

  if (sense.fields) {
    data.fields = {
      create: sense.fields.map(getField),
    } as SenseCreateData['fields'];
  }

  if (sense.gloss) {
    data.glosses = {
      create: sense.gloss.map(getGloss),
    } as SenseCreateData['glosses'];
  }

  if (sense.pos) {
    data.pos = { create: sense.pos.map(getPos) } as SenseCreateData['pos'];
  }

  if (sense.ant) {
    data.antonyms = { create: sense.ant.map(getAntonym) };
  }

  if (sense.xrefs) {
    data.xrefs = { create: sense.xrefs.map(getCrossRef) };
  }

  if (sense.langSources) {
    data.lSources = {
      create: sense.langSources.map(getLangSource),
    } as SenseCreateData['lSources'];
  }

  return data;
}

type MiscCreateData = Omit<
  Args<PrismaClient['jmDictMiscOnJmDictSense'], 'create'>['data'],
  'senseId'
>;
function getMisc(misc: JmDictSenseMisc): MiscCreateData {
  const data: MiscCreateData = {
    jmDictMiscId: misc,
  };
  return data;
}

type DialectCreateData = Omit<
  Args<PrismaClient['jmDictDialectOnJmDictSense'], 'create'>['data'],
  'senseId'
>;
function getDialect(dialect: JmDictDialect): DialectCreateData {
  const data: DialectCreateData = {
    jmDictDialectId: dialect,
  };
  return data;
}

type FieldCreateData = Omit<
  Args<PrismaClient['jmDictSenseFieldOnJmDictSense'], 'create'>['data'],
  'senseId'
>;
function getField(field: JmDictSenseField): FieldCreateData {
  const data: FieldCreateData = {
    jmDictSenseFieldId: field,
  };
  return data;
}

type GlossCreateData = Omit<
  Args<PrismaClient['jmDictGloss'], 'create'>['data'],
  'senseId'
>;
function getGloss(gloss: JmDictSenseGloss): GlossCreateData {
  if (typeof gloss === 'string') {
    return { text: gloss, lang: JmDictLang.ENGLISH };
  }
  const data: GlossCreateData = {
    lang: gloss.lang,
  };

  if (gloss.text) {
    data.text = gloss.text;
  }

  if (gloss.type) {
    data.type = gloss.type;
  }

  return data;
}

type PosCreateData = Omit<
  Args<PrismaClient['jmDictSensePosOnJmDictSense'], 'create'>['data'],
  'senseId'
>;
function getPos(pos: JmDictSensePos): PosCreateData {
  const data: PosCreateData = {
    jmDictSensePosId: pos,
  };
  return data;
}

type AntonymCreateData = Omit<
  Args<PrismaClient['jmDictAntonym'], 'create'>['data'],
  'senseId'
>;
function getAntonym(antonym: string): AntonymCreateData {
  const data: AntonymCreateData = {
    text: antonym,
  };
  return data;
}

type CrossRefCreateData = Omit<
  Args<PrismaClient['jmDictCrossReference'], 'create'>['data'],
  'senseId'
>;
function getCrossRef(xref: string): CrossRefCreateData {
  const data: CrossRefCreateData = {
    text: xref,
  };
  return data;
}

type LangSourceCreateData = Omit<
  Args<PrismaClient['jmDictLanguageSource'], 'create'>['data'],
  'senseId'
>;
function getLangSource({
  lang,
  text,
  type,
  wasei,
}: JmDictSenseLangSource): LangSourceCreateData {
  const data: LangSourceCreateData = {
    lang: lang,
  };

  if (text) {
    data.text = text;
  }

  if (type) {
    data.type = type;
  }

  if (wasei) {
    data.wasei = wasei;
  }

  return data;
}
