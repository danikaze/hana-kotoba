export interface JmDict {
  creationDate?: string;
  entries: JmDictEntry[];
}

export interface JmDictEntry {
  entSeq: number;
  kanjis?: JmDictKanjiElement[];
  readings: JmDictReadingElement[];
  senses: JmDictSenseElement[];
}

export interface JmDictKanjiElement {
  kEle: string;
  info?: JmDictKanjiInfo[];
  pri?: JmDictRePri[];
}

export interface JmDictReadingElement {
  rEle: string;
  noKanji?: true;
  restr?: string[];
  info?: JmDictReadingInfo[];
  pri?: JmDictRePri[];
}

export interface JmDictSenseElement {
  stagk?: string[];
  stagr?: string[];
  pos?: JmDictSensePos[];
  xrefs?: string[];
  ant?: string[];
  fields?: JmDictSenseField[];
  misc?: JmDictSenseMisc[];
  // info?: string; // removed on 1.08
  langSources?: JmDictSenseLangSource[];
  dialect?: JmDictDialect[];
  gloss?: JmDictSenseGloss[];
  // example?: string[]; // removed on 1.08
}

export type JmDictSenseLangSource = {
  text?: string;
  lang: JmDictLang;
  type?: JmDictLangSourceType;
  wasei?: true;
};

export type JmDictSenseGloss = {
  text?: string;
  lang: JmDictLang;
  type?: JmDictGlossType;
};

export type JmDictDialect = keyof typeof JM_DICT_DIALECT;
export const JM_DICT_DIALECT = {
  bra: 'Brazilian',
  hob: 'Hokkaido-ben',
  ksb: 'Kansai-ben',
  ktb: 'Kantou-ben',
  kyb: 'Kyoto-ben',
  kyu: 'Kyuushuu-ben',
  nab: 'Nagano-ben',
  osb: 'Osaka-ben',
  rkb: 'Ryuukyuu-ben',
  thb: 'Touhoku-ben',
  tsb: 'Tosa-ben',
  tsug: 'Tsugaru-ben',
} as const;

export type JmDictSenseField = keyof typeof JM_DICT_FIELD;
export const JM_DICT_FIELD = {
  agric: 'agriculture',
  anat: 'anatomy',
  archeol: 'archeology',
  archit: 'architecture',
  art: 'art, aesthetics',
  astron: 'astronomy',
  audvid: 'audiovisual',
  aviat: 'aviation',
  baseb: 'baseball',
  biochem: 'biochemistry',
  biol: 'biology',
  bot: 'botany',
  boxing: 'boxing',
  Buddh: 'Buddhism',
  bus: 'business',
  cards: 'card games',
  chem: 'chemistry',
  chmyth: 'Chinese mythology',
  Christn: 'Christianity',
  civeng: 'civil engineering',
  cloth: 'clothing',
  comp: 'computing',
  cryst: 'crystallography',
  dent: 'dentistry',
  ecol: 'ecology',
  econ: 'economics',
  elec: 'electricity, elec. eng.',
  electr: 'electronics',
  embryo: 'embryology',
  engr: 'engineering',
  ent: 'entomology',
  figskt: 'figure skating',
  film: 'film',
  finc: 'finance',
  fish: 'fishing',
  food: 'food, cooking',
  gardn: 'gardening, horticulture',
  genet: 'genetics',
  geogr: 'geography',
  geol: 'geology',
  geom: 'geometry',
  go: 'go (game)',
  golf: 'golf',
  gramm: 'grammar',
  grmyth: 'Greek mythology',
  hanaf: 'hanafuda',
  horse: 'horse racing',
  internet: 'Internet',
  jpmyth: 'Japanese mythology',
  kabuki: 'kabuki',
  law: 'law',
  ling: 'linguistics',
  logic: 'logic',
  MA: 'martial arts',
  mahj: 'mahjong',
  manga: 'manga',
  math: 'mathematics',
  mech: 'mechanical engineering',
  med: 'medicine',
  met: 'meteorology',
  mil: 'military',
  min: 'mineralogy',
  mining: 'mining',
  motor: 'motorsport',
  music: 'music',
  noh: 'noh',
  ornith: 'ornithology',
  paleo: 'paleontology',
  pathol: 'pathology',
  pharm: 'pharmacology',
  phil: 'philosophy',
  photo: 'photography',
  physics: 'physics',
  physiol: 'physiology',
  politics: 'politics',
  print: 'printing',
  prowres: 'professional wrestling',
  psy: 'psychiatry',
  psyanal: 'psychoanalysis',
  psych: 'psychology',
  rail: 'railway',
  rommyth: 'Roman mythology',
  Shinto: 'Shinto',
  shogi: 'shogi',
  ski: 'skiing',
  sports: 'sports',
  stat: 'statistics',
  stockm: 'stock market',
  sumo: 'sumo',
  surg: 'surgery',
  telec: 'telecommunications',
  tradem: 'trademark',
  tv: 'television',
  vet: 'veterinary terms',
  vidg: 'video games',
  zool: 'zoology',
} as const;

export type JmDictKanjiInfo = keyof typeof JM_DICT_KANJI_INFO;
export const JM_DICT_KANJI_INFO = {
  ateji: 'ateji (phonetic) reading',
  ik: 'word containing irregular kana usage',
  iK: 'word containing irregular kanji usage',
  io: 'irregular okurigana usage',
  oK: 'word containing out-dated kanji or kanji usage',
  rK: 'rarely used kanji form',
  sK: 'search-only kanji form',
} as const;

export type JmDictSenseMisc = keyof typeof JM_DICT_MISC;
export const JM_DICT_MISC = {
  abbr: 'abbreviation',
  arch: 'archaic',
  char: 'character',
  chn: "children's language",
  col: 'colloquial',
  company: 'company name',
  creat: 'creature',
  dated: 'dated term',
  dei: 'deity',
  derog: 'derogatory',
  doc: 'document',
  euph: 'euphemistic',
  ev: 'event',
  fam: 'familiar language',
  fem: 'female term or language',
  fict: 'fiction',
  form: 'formal or literary term',
  given: 'given name or forename, gender not specified',
  group: 'group',
  hist: 'historical term',
  hon: 'honorific or respectful (sonkeigo) language',
  hum: 'humble (kenjougo) language',
  id: 'idiomatic expression',
  joc: 'jocular, humorous term',
  leg: 'legend',
  m_sl: 'manga slang',
  male: 'male term or language',
  myth: 'mythology',
  net_sl: 'Internet slang',
  obj: 'object',
  obs: 'obsolete term',
  on_mim: 'onomatopoeic or mimetic word',
  organization: 'organization name',
  oth: 'other',
  person: 'full name of a particular person',
  place: 'place name',
  poet: 'poetical term',
  pol: 'polite (teineigo) language',
  product: 'product name',
  proverb: 'proverb',
  quote: 'quotation',
  rare: 'rare term',
  relig: 'religion',
  sens: 'sensitive',
  serv: 'service',
  ship: 'ship name',
  sl: 'slang',
  station: 'railway station',
  surname: 'family or surname',
  uk: 'word usually written using kana alone',
  unclass: 'unclassified name',
  vulg: 'vulgar expression or word',
  work: 'work of art, literature, music, etc. name',
  X: 'rude or X-rated term (not displayed in educational software)',
  yoji: 'yojijukugo',
} as const;

export type JmDictSensePos = keyof typeof JM_DICT_SENSE_POS;
export const JM_DICT_SENSE_POS = {
  unc: 'unclassified',
  adj_f: 'noun or verb acting prenominally',
  adj_i: 'adjective (keiyoushi)',
  adj_ix: 'adjective (keiyoushi) - yoi/ii class',
  adj_kari: "'kari' adjective (archaic)",
  adj_ku: "'ku' adjective (archaic)",
  adj_na: 'adjectival nouns or quasi-adjectives (keiyodoshi)',
  adj_nari: 'archaic/formal form of na-adjective',
  adj_no: "nouns which may take the genitive case particle 'no'",
  adj_pn: 'pre-noun adjectival (rentaishi)',
  adj_shiku: "'shiku' adjective (archaic)",
  adj_t: "'taru' adjective",
  adv: 'adverb (fukushi)',
  adv_to: "adverb taking the 'to' particle",
  aux: 'auxiliary',
  aux_adj: 'auxiliary adjective',
  aux_v: 'auxiliary verb',
  conj: 'conjunction',
  cop: 'copula',
  ctr: 'counter',
  exp: 'expressions (phrases, clauses, etc.)',
  int: 'interjection (kandoushi)',
  n: 'noun (common) (futsuumeishi)',
  n_adv: 'adverbial noun (fukushitekimeishi)',
  n_pr: 'proper noun',
  n_pref: 'noun, used as a prefix',
  n_suf: 'noun, used as a suffix',
  n_t: 'noun (temporal) (jisoumeishi)',
  num: 'numeric',
  pn: 'pronoun',
  pref: 'prefix',
  prt: 'particle',
  suf: 'suffix',
  v_unspec: 'verb unspecified',
  v1: 'Ichidan verb',
  v1_s: 'Ichidan verb - kureru special class',
  v2a_s: "Nidan verb with 'u' ending (archaic)",
  v2b_k: "Nidan verb (upper class) with 'bu' ending (archaic)",
  v2b_s: "Nidan verb (lower class) with 'bu' ending (archaic)",
  v2d_k: "Nidan verb (upper class) with 'dzu' ending (archaic)",
  v2d_s: "Nidan verb (lower class) with 'dzu' ending (archaic)",
  v2g_k: "Nidan verb (upper class) with 'gu' ending (archaic)",
  v2g_s: "Nidan verb (lower class) with 'gu' ending (archaic)",
  v2h_k: "Nidan verb (upper class) with 'hu/fu' ending (archaic)",
  v2h_s: "Nidan verb (lower class) with 'hu/fu' ending (archaic)",
  v2k_k: "Nidan verb (upper class) with 'ku' ending (archaic)",
  v2k_s: "Nidan verb (lower class) with 'ku' ending (archaic)",
  v2m_k: "Nidan verb (upper class) with 'mu' ending (archaic)",
  v2m_s: "Nidan verb (lower class) with 'mu' ending (archaic)",
  v2n_s: "Nidan verb (lower class) with 'nu' ending (archaic)",
  v2r_k: "Nidan verb (upper class) with 'ru' ending (archaic)",
  v2r_s: "Nidan verb (lower class) with 'ru' ending (archaic)",
  v2s_s: "Nidan verb (lower class) with 'su' ending (archaic)",
  v2t_k: "Nidan verb (upper class) with 'tsu' ending (archaic)",
  v2t_s: "Nidan verb (lower class) with 'tsu' ending (archaic)",
  v2w_s:
    "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)",
  v2y_k: "Nidan verb (upper class) with 'yu' ending (archaic)",
  v2y_s: "Nidan verb (lower class) with 'yu' ending (archaic)",
  v2z_s: "Nidan verb (lower class) with 'zu' ending (archaic)",
  v4b: "Yodan verb with 'bu' ending (archaic)",
  v4g: "Yodan verb with 'gu' ending (archaic)",
  v4h: "Yodan verb with 'hu/fu' ending (archaic)",
  v4k: "Yodan verb with 'ku' ending (archaic)",
  v4m: "Yodan verb with 'mu' ending (archaic)",
  v4n: "Yodan verb with 'nu' ending (archaic)",
  v4r: "Yodan verb with 'ru' ending (archaic)",
  v4s: "Yodan verb with 'su' ending (archaic)",
  v4t: "Yodan verb with 'tsu' ending (archaic)",
  v5aru: 'Godan verb - -aru special class',
  v5b: "Godan verb with 'bu' ending",
  v5g: "Godan verb with 'gu' ending",
  v5k: "Godan verb with 'ku' ending",
  v5k_s: 'Godan verb - Iku/Yuku special class',
  v5m: "Godan verb with 'mu' ending",
  v5n: "Godan verb with 'nu' ending",
  v5r: "Godan verb with 'ru' ending",
  v5r_i: "Godan verb with 'ru' ending (irregular verb)",
  v5s: "Godan verb with 'su' ending",
  v5t: "Godan verb with 'tsu' ending",
  v5u: "Godan verb with 'u' ending",
  v5u_s: "Godan verb with 'u' ending (special class)",
  v5uru: 'Godan verb - Uru old class verb (old form of Eru)',
  vi: 'intransitive verb',
  vk: 'Kuru verb - special class',
  vn: 'irregular nu verb',
  vr: 'irregular ru verb, plain form ends with -ri',
  vs: 'noun or participle which takes the aux. verb suru',
  vs_c: 'su verb - precursor to the modern suru',
  vs_i: 'suru verb - included',
  vs_s: 'suru verb - special class',
  vt: 'transitive verb',
  vz: 'Ichidan verb - zuru verb (alternative form of -jiru verbs)',
};

export type JmDictReadingInfo = keyof typeof JM_DICT_READING_INFO;
export const JM_DICT_READING_INFO = {
  gikun: 'gikun (meaning as reading) or jukujikun (special kanji reading)',
  ik: 'word containing irregular kana usage',
  ok: 'out-dated or obsolete kana usage',
  rk: 'rarely used kana form',
  sk: 'search-only kana form',
};

export enum JmDictLangSourceType {
  FULL = 'full',
  PARTIAL = 'part',
}

export type JmDictGlossType = keyof typeof JM_DICT_GLOSS_TYPE;
export const JM_DICT_GLOSS_TYPE = {
  lit: 'literal',
  fig: 'figurative',
  expl: 'explanation',
  tm: 'trademark',
};

export enum JmDictLang {
  ENGLISH = 'eng',
  DUTCH = 'dut',
  GERMAN = 'ger',
  RUSSIAN = 'rus',
  SPANISH = 'spa',
  HUNGARIAN = 'hun',
  SWEDEN = 'swe',
  FRENCH = 'fre',
  SLOVENIAN = 'slv',
  PORTUGUESE = 'por',
}

export type JmDictRePri =
  /**
   * appears in the "wordfreq" file compiled by Alexandre Girardi
   * from the Mainichi Shimbun. (See the Monash ftp archive for a copy.)
   * Words in the first 12,000 in that file are marked "news1" and words
   * in the second 12,000 are marked "news2"
   */
  | 'news1'
  | 'news2'
  /**
   * appears in the "Ichimango goi bunruishuu", Senmon Kyouiku
   * Publishing, Tokyo, 1998.  (The entries marked "ichi2" were
   * demoted from ichi1 because they were observed to have low
   * frequencies in the WWW and newspapers.)
   */
  | 'ichi1'
  | 'ichi2'
  /**
   * a small number of words use this marker when they
   * are detected as being common, but are not included in other lists.
   */
  | 'spec1'
  | 'spec2'
  /** common loanwords, based on the wordfreq file. */
  | 'gai1'
  | 'gai2'
  /**
   * nfxx: this is an indicator of frequency-of-use ranking in the
   * wordfreq file. "xx" is the number of the set of 500 words in which
   * the entry can be found, with "01" assigned to the first 500, "02"
   * to the second, and so on. (The entries with news1, ichi1, spec1, spec2
   * and gai1 values are marked with a "(P)" in the EDICT and EDICT2
   * files.)
   */
  | `nf${'0' | '1' | '2' | '3' | '4'}${number}`;
