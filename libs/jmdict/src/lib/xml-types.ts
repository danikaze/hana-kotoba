export interface XmlJmDictXml {
  '?xml': string;
  JMdict: {
    entry: XmlJmDictEntry[];
  };
}

/**
 * Entries consist of kanji elements, reading elements,
 * general information and sense elements. Each entry must have at
 * least one reading element and one sense element. Others are optional.
 */
export interface XmlJmDictEntry {
  /**
   * A unique numeric sequence number for each entry
   * The overwhelming majority of entries will have a single kanji
   * element associated with a word in Japanese. Where there are
   * multiple kanji elements within an entry, they will be orthographical
   * variants of the same word, either using variations in okurigana, or
   * alternative and equivalent kanji. Common "mis-spellings" may be
   * included, provided they are associated with appropriate information
   * fields. Synonyms are not included; they may be indicated in the
   * cross-reference field associated with the sense element.
   * */
  ent_seq: number;
  /**
   * The kanji element, or in its absence, the reading element
   * is the defining component of each entry
   */
  k_ele?: XmlJmDictKanjiElement | XmlJmDictKanjiElement[];
  /**
   * The reading element typically contains the valid readings
   * of the word(s) in the kanji element using modern kanadzukai.
   * Where there are multiple reading elements, they will typically be
   * alternative readings of the kanji element. In the absence of a
   * kanji element, i.e. in the case of a word or phrase written
   * entirely in kana, these elements will define the entry
   */
  r_ele: XmlJmDictReadingElement | XmlJmDictReadingElement[];
  sense: XmlJmDictSense | XmlJmDictSense[];
}

export interface XmlJmDictKanjiElement {
  /**
   * This element will contain a word or short phrase in Japanese
   * which is written using at least one non-kana character (usually kanji,
   * but can be other characters). The valid characters are
   * kanji, kana, related characters such as chouon and kurikaeshi, and
   * in exceptional cases, letters from other alphabets.
   */
  keb: string;
  /**
   * This is a coded information field related specifically to the
   * orthography of the keb, and will typically indicate some unusual
   * aspect, such as okurigana irregularity.
   */
  ke_inf?: XmlJmDictKanjiInfo | XmlJmDictKanjiInfo[];
  /**
   * This is a coded information field related specifically to the
   * orthography of the keb, and will typically indicate some unusual
   * aspect, such as okurigana irregularity.
   */
  ke_pri?: XmlJmDictRePri | XmlJmDictRePri[];
}

/**
 * The reading element typically contains the valid readings
 * of the word(s) in the kanji element using modern kanadzukai.
 * Where there are multiple reading elements, they will typically be
 * alternative readings of the kanji element. In the absence of a
 * kanji element, i.e. in the case of a word or phrase written
 * entirely in kana, these elements will define the entry.
 */
export interface XmlJmDictReadingElement {
  /**
   * this element content is restricted to kana and related
   * characters such as chouon and kurikaeshi. Kana usage will be
   * consistent between the keb and reb elements; e.g. if the keb
   * contains katakana, so too will the reb.
   */
  reb: string;
  /**
   * This element, which will usually have a null value, indicates
   * that the reb, while associated with the keb, cannot be regarded
   * as a true reading of the kanji. It is typically used for words
   * such as foreign place names, gairaigo which can be in kanji or
   * katakana, etc.
   */
  re_nokanji?: '';
  /**
   * This element is used to indicate when the reading only applies
   * to a subset of the keb elements in the entry. In its absence, all
   * readings apply to all kanji elements. The contents of this element
   * must exactly match those of one of the keb elements.
   */
  re_restr?: string | string[];
  /**
   * General coded information pertaining to the specific reading.
   * Typically it will be used to indicate some unusual aspect of
   * the reading.
   */
  re_inf?: XmlJmDictReadingInfo | XmlJmDictReadingInfo[];
  /**
   * See the comment on ke_pri above
   */
  re_pri?: XmlJmDictRePri | XmlJmDictRePri[];
}

/**
 * The sense element will record the translational equivalent
 * of the Japanese word, plus other related information. Where there
 * are several distinctly different meanings of the word, multiple
 * sense elements will be employed.
 */
export interface XmlJmDictSense {
  /**
   * These elements, if present, indicate that the sense is restricted
   * to the lexeme represented by the keb and/or reb.
   */
  stagk?: string | string[];
  /**
   * These elements, if present, indicate that the sense is restricted
   * to the lexeme represented by the keb and/or reb.
   */
  stagr?: string | string[];
  /**
   * Part-of-speech information about the entry/sense. Should use
   * appropriate entity codes. In general where there are multiple senses
   * in an entry, the part-of-speech of an earlier sense will apply to
   * later senses unless there is a new part-of-speech indicated.
   */
  pos?: XmlJmDictSensePos | XmlJmDictSensePos[];
  /**
   * This element is used to indicate a cross-reference to another
   * entry with a similar or related meaning or sense. The content of
   * this element is typically a keb or reb element in another entry. In some
   * cases a keb will be followed by a reb and/or a sense number to provide
   * a precise target for the cross-reference. Where this happens, a JIS
   * "centre-dot" (0x2126) is placed between the components of the
   * cross-reference. The target keb or reb must not contain a centre-dot.
   */
  xref?: string;
  /**
   * This element is used to indicate another entry which is an
   * antonym of the current entry/sense. The content of this element
   * must exactly match that of a keb or reb element in another entry.
   */
  ant?: string | string[];
  field?: XmlJmDictField | XmlJmDictField[];
  misc?: XmlJmDictMisc | XmlJmDictMisc[];
  /**
   * The sense-information elements provided for additional
   * information to be recorded about a sense. Typical usage would
   * be to indicate such things as level of currency of a sense, the
   * regional variations, etc.
   */
  s_inf?: string;
  /**
   * This element records the information about the source
   * language(s) of a loan-word/gairaigo. If the source language is other
   * than English, the language is indicated by the xml:lang attribute.
   * The element value (if any) is the source word or phrase.
   */
  lsource?: XmlJmDictLSource[];
  /**
   * For words specifically associated with regional dialects in
   * Japanese, the entity code for that dialect, e.g. ksb for Kansaiben.
   */
  dial?: XmlJmDictDialect | XmlJmDictDialect[];
  /**
   * Within each sense will be one or more "glosses", i.e.
   * target-language words or phrases which are equivalents to the
   * Japanese word. This element would normally be present, however it
   * may be omitted in entries which are purely for a cross-reference.
   */
  gloss?: XmlJmDictGloss[];
  /**
   * The example elements contain a Japanese sentence using the term
   * associated with the entry, and one or more translations of that sentence.
   * Within the element, the ex_srce element will indicate the source of the
   * sentences (typically the sequence number in the Tatoeba Project), the
   * ex_text element will contain the form of the term in the Japanese
   * sentence, and the ex_sent elements contain the example sentences.
   *
   * Was removed on 1.08
   */
  //example?: string | string[];
}

export type XmlJmDictLSource =
  | string
  | {
      '#text'?: string;
      /**
       * The xml:lang attribute defines the language(s) from which
       * a loanword is drawn.  It will be coded using the three-letter language
       * code from the ISO 639-2 standard. When absent, the value "eng" (i.e.
       * English) is the default value. The bibliographic (B) codes are used.
       */
      '@_lang'?: XmlJmDictLang;
      /**
       * The ls_type attribute indicates whether the lsource element
       * fully or partially describes the source word or phrase of the
       * loanword. If absent, it will have the implied value of "full".
       * Otherwise it will contain "part".
       */
      '@_ls_type'?: XmlJmDictLsType;
      /**
       * The ls_wasei attribute indicates that the Japanese word
       * has been constructed from words in the source language, and
       * not from an actual phrase in that language. Most commonly used to
       * indicate "waseieigo".
       */
      '@_ls_wasei'?: 'y';
    };

export type XmlJmDictGloss =
  | string
  | {
      '#text'?: string;
      /**
       * The xml:lang attribute defines the target language of the
       * gloss. It will be coded using the three-letter language code from
       * the ISO 639 standard. When absent, the value "eng" (i.e. English)
       * is the default value.
       */
      '@_xml:lang'?: XmlJmDictLang;
      /**
       * The g_type attribute specifies that the gloss is of a particular
       * type, e.g. "lit" (literal), "fig" (figurative), "expl" (explanation).
       */
      '@_g_type'?: XmlJmDictGlossType;
      /**
       * The g_gend attribute defines the gender of the gloss (typically
       * a noun in the target language. When absent, the gender is either
       * not relevant or has yet to be provided.
       */
      '@_g_gend'?: unknown;
    };

/** <dial> (dialect) entities  */
export type XmlJmDictDialect =
  | 'Brazilian'
  | 'Hokkaido-ben'
  | 'Kansai-ben'
  | 'Kantou-ben'
  | 'Kyoto-ben'
  | 'Kyuushuu-ben'
  | 'Nagano-ben'
  | 'Osaka-ben'
  | 'Ryuukyuu-ben'
  | 'Touhoku-ben'
  | 'Tosa-ben'
  | 'Tsugaru-ben';

/** <field> entities  */
export type XmlJmDictField =
  | 'agriculture'
  | 'anatomy'
  | 'archeology'
  | 'architecture'
  | 'art, aesthetics'
  | 'astronomy'
  | 'audiovisual'
  | 'aviation'
  | 'baseball'
  | 'biochemistry'
  | 'biology'
  | 'botany'
  | 'boxing'
  | 'Buddhism'
  | 'business'
  | 'card games'
  | 'chemistry'
  | 'Chinese mythology'
  | 'Christianity'
  | 'civil engineering'
  | 'clothing'
  | 'computing'
  | 'crystallography'
  | 'dentistry'
  | 'ecology'
  | 'economics'
  | 'electricity, elec. eng.'
  | 'electronics'
  | 'embryology'
  | 'engineering'
  | 'entomology'
  | 'figure skating'
  | 'film'
  | 'finance'
  | 'fishing'
  | 'food, cooking'
  | 'gardening, horticulture'
  | 'genetics'
  | 'geography'
  | 'geology'
  | 'geometry'
  | 'go (game)'
  | 'golf'
  | 'grammar'
  | 'Greek mythology'
  | 'hanafuda'
  | 'horse racing'
  | 'Internet'
  | 'Japanese mythology'
  | 'kabuki'
  | 'law'
  | 'linguistics'
  | 'logic'
  | 'martial arts'
  | 'mahjong'
  | 'manga'
  | 'mathematics'
  | 'mechanical engineering'
  | 'medicine'
  | 'meteorology'
  | 'military'
  | 'mineralogy'
  | 'mining'
  | 'motorsport'
  | 'music'
  | 'noh'
  | 'ornithology'
  | 'paleontology'
  | 'pathology'
  | 'pharmacology'
  | 'philosophy'
  | 'photography'
  | 'physics'
  | 'physiology'
  | 'politics'
  | 'printing'
  | 'professional wrestling'
  | 'psychiatry'
  | 'psychoanalysis'
  | 'psychology'
  | 'railway'
  | 'Roman mythology'
  | 'Shinto'
  | 'shogi'
  | 'skiing'
  | 'sports'
  | 'statistics'
  | 'stock market'
  | 'sumo'
  | 'surgery'
  | 'telecommunications'
  | 'trademark'
  | 'television'
  | 'veterinary terms'
  | 'video games'
  | 'zoology';

/** <ke_inf> (kanji info) entities */
export type XmlJmDictKanjiInfo =
  | 'ateji (phonetic) reading'
  | 'word containing irregular kana usage'
  | 'word containing irregular kanji usage'
  | 'irregular okurigana usage'
  | 'word containing out-dated kanji or kanji usage'
  | 'rarely used kanji form'
  | 'search-only kanji form';

/** <misc> (miscellaneous) entities */
export type XmlJmDictMisc =
  | 'abbreviation'
  | 'archaic'
  | 'character'
  | "children's language"
  | 'colloquial'
  | 'company name'
  | 'creature'
  | 'dated term'
  | 'deity'
  | 'derogatory'
  | 'document'
  | 'euphemistic'
  | 'event'
  | 'familiar language'
  | 'female term or language'
  | 'fiction'
  | 'formal or literary term'
  | 'given name or forename, gender not specified'
  | 'group'
  | 'historical term'
  | 'honorific or respectful (sonkeigo) language'
  | 'humble (kenjougo) language'
  | 'idiomatic expression'
  | 'jocular, humorous term'
  | 'legend'
  | 'manga slang'
  | 'male term or language'
  | 'mythology'
  | 'Internet slang'
  | 'object'
  | 'obsolete term'
  | 'onomatopoeic or mimetic word'
  | 'organization name'
  | 'other'
  | 'full name of a particular person'
  | 'place name'
  | 'poetical term'
  | 'polite (teineigo) language'
  | 'product name'
  | 'proverb'
  | 'quotation'
  | 'rare term'
  | 'religion'
  | 'sensitive'
  | 'service'
  | 'ship name'
  | 'slang'
  | 'railway station'
  | 'family or surname'
  | 'word usually written using kana alone'
  | 'unclassified name'
  | 'vulgar expression or word'
  | 'work of art, literature, music, etc. name'
  | 'rude or X-rated term (not displayed in educational software)'
  | 'yojijukugo';

/** <pos> (part-of-speech) entities */
export type XmlJmDictSensePos =
  | 'unclassified'
  | 'noun or verb acting prenominally'
  | 'adjective (keiyoushi)'
  | 'adjective (keiyoushi) - yoi/ii class'
  | "'kari' adjective (archaic)"
  | "'ku' adjective (archaic)"
  | 'adjectival nouns or quasi-adjectives (keiyodoshi)'
  | 'archaic/formal form of na-adjective'
  | "nouns which may take the genitive case particle 'no'"
  | 'pre-noun adjectival (rentaishi)'
  | "'shiku' adjective (archaic)"
  | "'taru' adjective"
  | 'adverb (fukushi)'
  | "adverb taking the 'to' particle"
  | 'auxiliary'
  | 'auxiliary adjective'
  | 'auxiliary verb'
  | 'conjunction'
  | 'copula'
  | 'counter'
  | 'expressions (phrases, clauses, etc.)'
  | 'interjection (kandoushi)'
  | 'noun (common) (futsuumeishi)'
  | 'adverbial noun (fukushitekimeishi)'
  | 'proper noun'
  | 'noun, used as a prefix'
  | 'noun, used as a suffix'
  | 'noun (temporal) (jisoumeishi)'
  | 'numeric'
  | 'pronoun'
  | 'prefix'
  | 'particle'
  | 'suffix'
  | 'verb unspecified'
  | 'Ichidan verb'
  | 'Ichidan verb - kureru special class'
  | "Nidan verb with 'u' ending (archaic)"
  | "Nidan verb (upper class) with 'bu' ending (archaic)"
  | "Nidan verb (lower class) with 'bu' ending (archaic)"
  | "Nidan verb (upper class) with 'dzu' ending (archaic)"
  | "Nidan verb (lower class) with 'dzu' ending (archaic)"
  | "Nidan verb (upper class) with 'gu' ending (archaic)"
  | "Nidan verb (lower class) with 'gu' ending (archaic)"
  | "Nidan verb (upper class) with 'hu/fu' ending (archaic)"
  | "Nidan verb (lower class) with 'hu/fu' ending (archaic)"
  | "Nidan verb (upper class) with 'ku' ending (archaic)"
  | "Nidan verb (lower class) with 'ku' ending (archaic)"
  | "Nidan verb (upper class) with 'mu' ending (archaic)"
  | "Nidan verb (lower class) with 'mu' ending (archaic)"
  | "Nidan verb (lower class) with 'nu' ending (archaic)"
  | "Nidan verb (upper class) with 'ru' ending (archaic)"
  | "Nidan verb (lower class) with 'ru' ending (archaic)"
  | "Nidan verb (lower class) with 'su' ending (archaic)"
  | "Nidan verb (upper class) with 'tsu' ending (archaic)"
  | "Nidan verb (lower class) with 'tsu' ending (archaic)"
  | "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)"
  | "Nidan verb (upper class) with 'yu' ending (archaic)"
  | "Nidan verb (lower class) with 'yu' ending (archaic)"
  | "Nidan verb (lower class) with 'zu' ending (archaic)"
  | "Yodan verb with 'bu' ending (archaic)"
  | "Yodan verb with 'gu' ending (archaic)"
  | "Yodan verb with 'hu/fu' ending (archaic)"
  | "Yodan verb with 'ku' ending (archaic)"
  | "Yodan verb with 'mu' ending (archaic)"
  | "Yodan verb with 'nu' ending (archaic)"
  | "Yodan verb with 'ru' ending (archaic)"
  | "Yodan verb with 'su' ending (archaic)"
  | "Yodan verb with 'tsu' ending (archaic)"
  | 'Godan verb - -aru special class'
  | "Godan verb with 'bu' ending"
  | "Godan verb with 'gu' ending"
  | "Godan verb with 'ku' ending"
  | 'Godan verb - Iku/Yuku special class'
  | "Godan verb with 'mu' ending"
  | "Godan verb with 'nu' ending"
  | "Godan verb with 'ru' ending"
  | "Godan verb with 'ru' ending (irregular verb)"
  | "Godan verb with 'su' ending"
  | "Godan verb with 'tsu' ending"
  | "Godan verb with 'u' ending"
  | "Godan verb with 'u' ending (special class)"
  | 'Godan verb - Uru old class verb (old form of Eru)'
  | 'intransitive verb'
  | 'Kuru verb - special class'
  | 'irregular nu verb'
  | 'irregular ru verb, plain form ends with -ri'
  | 'noun or participle which takes the aux. verb suru'
  | 'su verb - precursor to the modern suru'
  | 'suru verb - included'
  | 'suru verb - special class'
  | 'transitive verb'
  | 'Ichidan verb - zuru verb (alternative form of -jiru verbs)';

export type XmlJmDictReadingInfo =
  | 'gikun (meaning as reading) or jukujikun (special kanji reading)'
  | 'word containing irregular kana usage'
  | 'out-dated or obsolete kana usage'
  | 'rarely used kana form'
  | 'search-only kana form';

export type XmlJmDictLsType = 'full' | 'part';

export type XmlJmDictGlossType = 'lit' | 'fig' | 'expl' | 'tm';

export type XmlJmDictLang =
  | 'eng'
  | 'dut'
  | 'ger'
  | 'rus'
  | 'spa'
  | 'hun'
  | 'swe'
  | 'fre'
  | 'slv'
  | 'por';

export type XmlJmDictRePri =
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
