import { parseJmDictXml } from './parse-jmdict-xml';
import { JmDict, JmDictEntry, JmDictLang, JmDictLangSourceType } from './types';

describe('parseJmDictXml', () => {
  it('should throw an error on invalid XML', async () => {
    await expect(
      parseJmDictXml(`<noEntry></noEntry>`, true)
    ).rejects.toBeTruthy();
  });

  it('should parse simple english entries', async () =>
    testXml(
      `
      <entry>
        <ent_seq>1000000</ent_seq>
        <r_ele>
          <reb>ヽ</reb>
        </r_ele>
        <sense>
          <pos>&unc;</pos>
          <xref>一の字点</xref>
          <gloss g_type="expl">repetition mark in katakana</gloss>
        </sense>
      </entry>
    `,
      [
        {
          entSeq: 1000000,
          readings: [{ rEle: 'ヽ' }],
          senses: [
            {
              pos: ['unc'],
              xrefs: ['一の字点'],
              gloss: [
                {
                  text: 'repetition mark in katakana',
                  lang: JmDictLang.ENGLISH,
                  type: 'expl',
                },
              ],
            },
          ],
        },
      ]
    ));

  it('should parse multi-lingual entries', () =>
    testXml(
      `<entry>
  <ent_seq>1323080</ent_seq>
  <k_ele>
    <keb>車</keb>
    <ke_pri>ichi1</ke_pri>
    <ke_pri>news1</ke_pri>
    <ke_pri>nf01</ke_pri>
  </k_ele>
  <r_ele>
    <reb>くるま</reb>
    <re_pri>ichi1</re_pri>
    <re_pri>news1</re_pri>
    <re_pri>nf01</re_pri>
  </r_ele>
  <r_ele>
    <reb>クルマ</reb>
    <re_nokanji/>
  </r_ele>
  <sense>
    <pos>&n;</pos>
    <gloss>car</gloss>
    <gloss>automobile</gloss>
    <gloss>vehicle</gloss>
  </sense>
  <sense>
    <pos>&n;</pos>
    <gloss>wheel</gloss>
    <gloss>castor</gloss>
    <gloss>caster</gloss>
  </sense>
  <sense>
    <gloss xml:lang="dut">wiel</gloss>
    <gloss xml:lang="dut">rad</gloss>
  </sense>
  <sense>
    <gloss xml:lang="dut">voertuig op wielen</gloss>
    <gloss xml:lang="dut">rijtuig</gloss>
    <gloss xml:lang="dut">koets</gloss>
    <gloss xml:lang="dut">wagen</gloss>
    <gloss xml:lang="dut">kar</gloss>
  </sense>
  <sense>
    <gloss xml:lang="dut">riksja</gloss>
  </sense>
  <sense>
    <gloss xml:lang="dut">auto</gloss>
    <gloss xml:lang="dut">wagen</gloss>
    <gloss xml:lang="dut">automobiel</gloss>
  </sense>
  <sense>
    <gloss xml:lang="dut">ring</gloss>
    <gloss xml:lang="dut">vorm van een ring</gloss>
    <gloss xml:lang="dut">ringvormig object</gloss>
  </sense>
  <sense>
    <gloss xml:lang="fre">véhicule</gloss>
    <gloss xml:lang="fre">voiture</gloss>
    <gloss xml:lang="fre">automobile</gloss>
  </sense>
  <sense>
    <gloss xml:lang="fre">roue</gloss>
  </sense>
  <sense>
    <gloss xml:lang="ger">Rad</gloss>
  </sense>
  <sense>
    <gloss xml:lang="ger">Wagen</gloss>
    <gloss xml:lang="ger">Auto</gloss>
    <gloss xml:lang="ger">Karren</gloss>
    <gloss xml:lang="ger">Fuhrwerk</gloss>
    <gloss xml:lang="ger">Gefährt</gloss>
    <gloss xml:lang="ger">Wagon</gloss>
    <gloss xml:lang="ger">Taxi</gloss>
  </sense>
  <sense>
    <gloss xml:lang="hun">autó</gloss>
    <gloss xml:lang="hun">kocsikerék</gloss>
  </sense>
  <sense>
    <gloss xml:lang="rus">1) повозка; экипаж; [ручная] тележка; [ломовая] телега; воз; фургон; [авто]машина; такси; вагон</gloss>
    <gloss xml:lang="rus">2) ((уст.) 俥) коляска рикши, рикша</gloss>
    <gloss xml:lang="rus">3) колесо</gloss>
  </sense>
  <sense>
    <gloss xml:lang="slv">avto</gloss>
    <gloss xml:lang="slv">avtomobil</gloss>
    <gloss xml:lang="slv">kolo</gloss>
    <gloss xml:lang="slv">kolesce</gloss>
  </sense>
  <sense>
    <gloss xml:lang="spa">automóvil</gloss>
    <gloss xml:lang="spa">coche</gloss>
    <gloss xml:lang="spa">vehículo</gloss>
    <gloss xml:lang="spa">(am) carro</gloss>
  </sense>
  <sense>
    <gloss xml:lang="spa">rueda</gloss>
  </sense>
  <sense>
    <gloss xml:lang="swe">bil</gloss>
  </sense>
</entry>`,
      [
        {
          entSeq: 1323080,
          kanjis: [
            {
              kEle: '車',
              pri: ['ichi1', 'news1', 'nf01'],
            },
          ],
          readings: [
            {
              rEle: 'くるま',
              pri: ['ichi1', 'news1', 'nf01'],
            },
            {
              rEle: 'クルマ',
              noKanji: true,
            },
          ],
          senses: [
            {
              pos: ['n'],
              gloss: [
                { text: 'car', lang: JmDictLang.ENGLISH },
                { text: 'automobile', lang: JmDictLang.ENGLISH },
                { text: 'vehicle', lang: JmDictLang.ENGLISH },
              ],
            },
            {
              pos: ['n'],
              gloss: [
                { text: 'wheel', lang: JmDictLang.ENGLISH },
                { text: 'castor', lang: JmDictLang.ENGLISH },
                { text: 'caster', lang: JmDictLang.ENGLISH },
              ],
            },
            {
              gloss: [
                { text: 'wiel', lang: JmDictLang.DUTCH },
                { text: 'rad', lang: JmDictLang.DUTCH },
              ],
            },
            {
              gloss: [
                { text: 'voertuig op wielen', lang: JmDictLang.DUTCH },
                { text: 'rijtuig', lang: JmDictLang.DUTCH },
                { text: 'koets', lang: JmDictLang.DUTCH },
                { text: 'wagen', lang: JmDictLang.DUTCH },
                { text: 'kar', lang: JmDictLang.DUTCH },
              ],
            },
            {
              gloss: [{ text: 'riksja', lang: JmDictLang.DUTCH }],
            },
            {
              gloss: [
                { text: 'auto', lang: JmDictLang.DUTCH },
                { text: 'wagen', lang: JmDictLang.DUTCH },
                { text: 'automobiel', lang: JmDictLang.DUTCH },
              ],
            },
            {
              gloss: [
                { text: 'ring', lang: JmDictLang.DUTCH },
                { text: 'vorm van een ring', lang: JmDictLang.DUTCH },
                { text: 'ringvormig object', lang: JmDictLang.DUTCH },
              ],
            },
            {
              gloss: [
                { text: 'véhicule', lang: JmDictLang.FRENCH },
                { text: 'voiture', lang: JmDictLang.FRENCH },
                { text: 'automobile', lang: JmDictLang.FRENCH },
              ],
            },
            {
              gloss: [{ text: 'roue', lang: JmDictLang.FRENCH }],
            },
            {
              gloss: [{ text: 'Rad', lang: JmDictLang.GERMAN }],
            },
            {
              gloss: [
                { text: 'Wagen', lang: JmDictLang.GERMAN },
                { text: 'Auto', lang: JmDictLang.GERMAN },
                { text: 'Karren', lang: JmDictLang.GERMAN },
                { text: 'Fuhrwerk', lang: JmDictLang.GERMAN },
                { text: 'Gefährt', lang: JmDictLang.GERMAN },
                { text: 'Wagon', lang: JmDictLang.GERMAN },
                { text: 'Taxi', lang: JmDictLang.GERMAN },
              ],
            },
            {
              gloss: [
                { text: 'autó', lang: JmDictLang.HUNGARIAN },
                { text: 'kocsikerék', lang: JmDictLang.HUNGARIAN },
              ],
            },
            {
              gloss: [
                {
                  text: '1) повозка; экипаж; [ручная] тележка; [ломовая] телега; воз; фургон; [авто]машина; такси; вагон',
                  lang: JmDictLang.RUSSIAN,
                },
                {
                  text: '2) ((уст.) 俥) коляска рикши, рикша',
                  lang: JmDictLang.RUSSIAN,
                },
                { text: '3) колесо', lang: JmDictLang.RUSSIAN },
              ],
            },
            {
              gloss: [
                { text: 'avto', lang: JmDictLang.SLOVENIAN },
                { text: 'avtomobil', lang: JmDictLang.SLOVENIAN },
                { text: 'kolo', lang: JmDictLang.SLOVENIAN },
                { text: 'kolesce', lang: JmDictLang.SLOVENIAN },
              ],
            },
            {
              gloss: [
                { text: 'automóvil', lang: JmDictLang.SPANISH },
                { text: 'coche', lang: JmDictLang.SPANISH },
                { text: 'vehículo', lang: JmDictLang.SPANISH },
                { text: '(am) carro', lang: JmDictLang.SPANISH },
              ],
            },
            {
              gloss: [{ text: 'rueda', lang: JmDictLang.SPANISH }],
            },
            {
              gloss: [{ text: 'bil', lang: JmDictLang.SWEDEN }],
            },
          ],
        },
      ]
    ));

  it('should return entries ordered by entSeq', () =>
    testXml(
      `
    <entry>
      <ent_seq>12</ent_seq>
      <r_ele><reb>Test 1</reb></r_ele>
      <sense></sense>
    </entry>
    <entry>
      <ent_seq>78</ent_seq>
      <r_ele><reb>Test 3</reb></r_ele>
      <sense></sense>
    </entry>
    <entry>
      <ent_seq>34</ent_seq>
      <r_ele><reb>Test 2</reb></r_ele>
      <sense></sense>
    </entry>
    `,
      [
        {
          entSeq: 12,
          readings: [{ rEle: 'Test 1' }],
          senses: [{}],
        },
        {
          entSeq: 34,
          readings: [{ rEle: 'Test 2' }],
          senses: [{}],
        },
        {
          entSeq: 78,
          readings: [{ rEle: 'Test 3' }],
          senses: [{}],
        },
      ]
    ));

  it('should provide every field', () => {
    testXml(
      `
      <entry>
        <ent_seq>1234</ent_seq>
        <k_ele>
          <keb>実験</keb>
          <ke_inf>&rK;</ke_inf>
        </k_ele>
        <r_ele>
          <reb>テスト</reb>
          <re_restr>実験</re_restr>
          <re_inf>&sk;</re_inf>
        </r_ele>
        <sense>
          <stagk>実験</stagk>
          <stagk>実験</stagk>
          <stagr>テスト</stagk>
          <pos>&n;</pos>
          <pos>&vt;</pos>
          <ant>事実</ant>
          <lsource ls_wasei="y" ls_type="full">test</lsource>
          <gloss>Test element</gloss>
          <misc>&uk;</misc>
          <field>&internet;</field>
          <dial>&ksb;</dial>
          <dial>&bra;</dial>
        </sense>
      </entry>
      `,
      [
        {
          entSeq: 1234,
          readings: [{ rEle: 'テスト', restr: ['実験'], info: ['sk'] }],
          kanjis: [{ kEle: '実験', info: ['rK'] }],
          senses: [
            {
              stagk: ['実験', '実験'],
              stagr: ['テスト'],
              ant: ['事実'],
              langSources: [
                {
                  wasei: true,
                  text: 'test',
                  lang: JmDictLang.ENGLISH,
                  type: JmDictLangSourceType.FULL,
                },
              ],
              gloss: [{ text: 'Test element', lang: JmDictLang.ENGLISH }],
              misc: ['uk'],
              fields: ['internet'],
              pos: ['n', 'vt'],
              dialect: ['ksb', 'bra'],
            },
          ],
        },
      ]
    );
  });

  async function testXml(
    entriesXml: string,
    expectedEntries: JmDictEntry[]
  ): Promise<void> {
    const xml = getXml(entriesXml);
    const data = await parseJmDictXml(xml, true);
    expect(data).toEqual(getExpectedXml(expectedEntries));
  }

  function getExpectedXml(entries: JmDictEntry[]): JmDict {
    return {
      creationDate: '2024-02-15',
      entries: [
        ...entries,
        {
          entSeq: 9999999,
          kanjis: [{ kEle: 'ＪＭｄｉｃｔ' }],
          readings: [{ rEle: 'ジェイエムディクト' }],
          senses: [
            {
              pos: ['unc'],
              gloss: [
                {
                  text: 'Japanese-Multilingual Dictionary Project - Creation Date: 2024-02-15',
                  lang: JmDictLang.ENGLISH,
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Return a real full XML file with the provided entries
   */
  function getXml(entryData: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <!-- Rev 1.09
                Added the g_type attribute
        -->
    <!-- Rev 1.08
                Delete <info> and <example> elements
        -->
    <!-- Rev 1.07
                Revised POS tags for the adjectives
        -->
    <!-- Rev 1.06
                Dropped the "*" from the end of the entry element.
                Dropped the g_lang attribute in favour of xml:lang
                Dropped the <lang> element and replaced it with <lsource> at the
                sense level.
                Moved <dial> from the entry level to the sense level.
                Changed "info*" to "info?".
        -->
    <!-- Rev 1.05
                Changed the <gram> element name to <pos>
                Added the g_gend attribute
                moved the s_inf element
        -->
    <!-- Rev 1.04
                Changes:
                Rename the project  "JMdict" and add the g_lang attribute to the
                <gloss> entity - 08 May 1999
                Moved the <gram>, <field> and <misc> elements down to be in the
                <sense> region, as suggested by Chris Czeyka. I have also tidied up
                some of the "*" as he suggested.  - 27 May 2000
                Added the re_nokanji element - Sep 2003.
             -->
    <!DOCTYPE JMdict [
        <!ELEMENT JMdict (entry*)>
    <!--                                                                   -->
    <!ELEMENT entry (ent_seq, k_ele*, r_ele+, sense+)>
    <!-- Entries consist of kanji elements, reading elements,
                general information and sense elements. Each entry must have at
                least one reading element and one sense element. Others are optional.
                -->
    <!ELEMENT ent_seq (#PCDATA)>
    <!-- A unique numeric sequence number for each entry
                -->
    <!ELEMENT k_ele (keb, ke_inf*, ke_pri*)>
    <!-- The kanji element, or in its absence, the reading element, is
                the defining component of each entry.
                The overwhelming majority of entries will have a single kanji
                element associated with a word in Japanese. Where there are
                multiple kanji elements within an entry, they will be orthographical
                variants of the same word, either using variations in okurigana, or
                alternative and equivalent kanji. Common "mis-spellings" may be
                included, provided they are associated with appropriate information
                fields. Synonyms are not included; they may be indicated in the
                cross-reference field associated with the sense element.
                -->
    <!ELEMENT keb (#PCDATA)>
    <!-- This element will contain a word or short phrase in Japanese
                which is written using at least one non-kana character (usually kanji,
                but can be other characters). The valid characters are
                kanji, kana, related characters such as chouon and kurikaeshi, and
                in exceptional cases, letters from other alphabets.
                -->
    <!ELEMENT ke_inf (#PCDATA)>
    <!-- This is a coded information field related specifically to the
                orthography of the keb, and will typically indicate some unusual
                aspect, such as okurigana irregularity.
                -->
    <!ELEMENT ke_pri (#PCDATA)>
    <!-- This and the equivalent re_pri field are provided to record
                information about the relative priority of the entry,  and consist
                of codes indicating the word appears in various references which
                can be taken as an indication of the frequency with which the word
                is used. This field is intended for use either by applications which
                want to concentrate on entries of  a particular priority, or to
                generate subset files.
                The current values in this field are:
                - news1/2: appears in the "wordfreq" file compiled by Alexandre Girardi
                from the Mainichi Shimbun. (See the Monash ftp archive for a copy.)
                Words in the first 12,000 in that file are marked "news1" and words
                in the second 12,000 are marked "news2".
                - ichi1/2: appears in the "Ichimango goi bunruishuu", Senmon Kyouiku
                Publishing, Tokyo, 1998.  (The entries marked "ichi2" were
                demoted from ichi1 because they were observed to have low
                frequencies in the WWW and newspapers.)
                - spec1 and spec2: a small number of words use this marker when they
                are detected as being common, but are not included in other lists.
                - gai1/2: common loanwords, based on the wordfreq file.
                - nfxx: this is an indicator of frequency-of-use ranking in the
                wordfreq file. "xx" is the number of the set of 500 words in which
                the entry can be found, with "01" assigned to the first 500, "02"
                to the second, and so on. (The entries with news1, ichi1, spec1, spec2
                and gai1 values are marked with a "(P)" in the EDICT and EDICT2
                files.)

                The reason both the kanji and reading elements are tagged is because
                on occasions a priority is only associated with a particular
                kanji/reading pair.
                -->
    <!--                                                                   -->
    <!ELEMENT r_ele (reb, re_nokanji?, re_restr*, re_inf*, re_pri*)>
    <!-- The reading element typically contains the valid readings
                of the word(s) in the kanji element using modern kanadzukai.
                Where there are multiple reading elements, they will typically be
                alternative readings of the kanji element. In the absence of a
                kanji element, i.e. in the case of a word or phrase written
                entirely in kana, these elements will define the entry.
                -->
    <!ELEMENT reb (#PCDATA)>
    <!-- this element content is restricted to kana and related
                characters such as chouon and kurikaeshi. Kana usage will be
                consistent between the keb and reb elements; e.g. if the keb
                contains katakana, so too will the reb.
                -->
    <!ELEMENT re_nokanji (#PCDATA)>
    <!-- This element, which will usually have a null value, indicates
                that the reb, while associated with the keb, cannot be regarded
                as a true reading of the kanji. It is typically used for words
                such as foreign place names, gairaigo which can be in kanji or
                katakana, etc.
                -->
    <!ELEMENT re_restr (#PCDATA)>
    <!-- This element is used to indicate when the reading only applies
                to a subset of the keb elements in the entry. In its absence, all
                readings apply to all kanji elements. The contents of this element
                must exactly match those of one of the keb elements.
                -->
    <!ELEMENT re_inf (#PCDATA)>
    <!-- General coded information pertaining to the specific reading.
                Typically it will be used to indicate some unusual aspect of
                the reading. -->
    <!ELEMENT re_pri (#PCDATA)>
    <!-- See the comment on ke_pri above. -->
    <!--                                                                   -->
    <!ELEMENT sense (stagk*, stagr*, pos*, xref*, ant*, field*, misc*, s_inf*, lsource*, dial*, gloss*, example*)>
    <!-- The sense element will record the translational equivalent
                of the Japanese word, plus other related information. Where there
                are several distinctly different meanings of the word, multiple
                sense elements will be employed.
                -->
    <!ELEMENT stagk (#PCDATA)>
    <!ELEMENT stagr (#PCDATA)>
    <!-- These elements, if present, indicate that the sense is restricted
                to the lexeme represented by the keb and/or reb. -->
    <!ELEMENT xref (#PCDATA)*>
    <!-- This element is used to indicate a cross-reference to another
                entry with a similar or related meaning or sense. The content of
                this element is typically a keb or reb element in another entry. In some
                cases a keb will be followed by a reb and/or a sense number to provide
                a precise target for the cross-reference. Where this happens, a JIS
                "centre-dot" (0x2126) is placed between the components of the
                cross-reference. The target keb or reb must not contain a centre-dot.
                -->
    <!ELEMENT ant (#PCDATA)*>
    <!-- This element is used to indicate another entry which is an
                antonym of the current entry/sense. The content of this element
                must exactly match that of a keb or reb element in another entry.
                -->
    <!ELEMENT pos (#PCDATA)>
    <!-- Part-of-speech information about the entry/sense. Should use
                appropriate entity codes. In general where there are multiple senses
                in an entry, the part-of-speech of an earlier sense will apply to
                later senses unless there is a new part-of-speech indicated.
                -->
    <!ELEMENT field (#PCDATA)>
    <!-- Information about the field of application of the entry/sense.
                When absent, general application is implied. Entity coding for
                specific fields of application. -->
    <!ELEMENT misc (#PCDATA)>
    <!-- This element is used for other relevant information about
                the entry/sense. As with part-of-speech, information will usually
                apply to several senses.
                -->
    <!ELEMENT lsource (#PCDATA)>
    <!-- This element records the information about the source
                language(s) of a loan-word/gairaigo. If the source language is other
                than English, the language is indicated by the xml:lang attribute.
                The element value (if any) is the source word or phrase.
                -->
    <!ATTLIST lsource xml:lang CDATA "eng">
    <!-- The xml:lang attribute defines the language(s) from which
                a loanword is drawn.  It will be coded using the three-letter language
                code from the ISO 639-2 standard. When absent, the value "eng" (i.e.
                English) is the default value. The bibliographic (B) codes are used. -->
    <!ATTLIST lsource ls_type CDATA #IMPLIED>
    <!-- The ls_type attribute indicates whether the lsource element
                fully or partially describes the source word or phrase of the
                loanword. If absent, it will have the implied value of "full".
                Otherwise it will contain "part".  -->
    <!ATTLIST lsource ls_wasei CDATA #IMPLIED>
    <!-- The ls_wasei attribute indicates that the Japanese word
                has been constructed from words in the source language, and
                not from an actual phrase in that language. Most commonly used to
                indicate "waseieigo". -->
    <!ELEMENT dial (#PCDATA)>
    <!-- For words specifically associated with regional dialects in
                Japanese, the entity code for that dialect, e.g. ksb for Kansaiben.
                -->
    <!ELEMENT gloss (#PCDATA | pri)*>
    <!-- Within each sense will be one or more "glosses", i.e.
                target-language words or phrases which are equivalents to the
                Japanese word. This element would normally be present, however it
                may be omitted in entries which are purely for a cross-reference.
                -->
    <!ATTLIST gloss xml:lang CDATA "eng">
    <!-- The xml:lang attribute defines the target language of the
                gloss. It will be coded using the three-letter language code from
                the ISO 639 standard. When absent, the value "eng" (i.e. English)
                is the default value. -->
    <!ATTLIST gloss g_gend CDATA #IMPLIED>
    <!-- The g_gend attribute defines the gender of the gloss (typically
                a noun in the target language. When absent, the gender is either
                not relevant or has yet to be provided.
                -->
    <!ATTLIST gloss g_type CDATA #IMPLIED>
    <!-- The g_type attribute specifies that the gloss is of a particular
                type, e.g. "lit" (literal), "fig" (figurative), "expl" (explanation).
                -->
    <!ELEMENT pri (#PCDATA)>
    <!-- These elements highlight particular target-language words which
                are strongly associated with the Japanese word. The purpose is to
                establish a set of target-language words which can effectively be
                used as head-words in a reverse target-language/Japanese relationship.
                -->
    <!ELEMENT s_inf (#PCDATA)>
    <!-- The sense-information elements provided for additional
                information to be recorded about a sense. Typical usage would
                be to indicate such things as level of currency of a sense, the
                regional variations, etc.
                -->
    <!ELEMENT example (ex_srce,ex_text,ex_sent+)>
    <!-- The example elements contain a Japanese sentence using the term
            associated with the entry, and one or more translations of that sentence.
            Within the element, the ex_srce element will indicate the source of the
            sentences (typically the sequence number in the Tatoeba Project), the
            ex_text element will contain the form of the term in the Japanese
            sentence, and the ex_sent elements contain the example sentences.
            -->
    <!ELEMENT ex_srce (#PCDATA)>
    <!ELEMENT ex_text (#PCDATA)>
    <!ELEMENT ex_sent (#PCDATA)>
    <!ATTLIST ex_sent xml:lang CDATA "eng">
    <!ATTLIST ex_srce exsrc_type CDATA #IMPLIED>
    <!-- The following entity codes are used for common elements within the
        various information fields.
        -->
    <!-- <dial> (dialect) entities -->
    <!ENTITY bra "Brazilian">
    <!ENTITY hob "Hokkaido-ben">
    <!ENTITY ksb "Kansai-ben">
    <!ENTITY ktb "Kantou-ben">
    <!ENTITY kyb "Kyoto-ben">
    <!ENTITY kyu "Kyuushuu-ben">
    <!ENTITY nab "Nagano-ben">
    <!ENTITY osb "Osaka-ben">
    <!ENTITY rkb "Ryuukyuu-ben">
    <!ENTITY thb "Touhoku-ben">
    <!ENTITY tsb "Tosa-ben">
    <!ENTITY tsug "Tsugaru-ben">
    <!-- <field> entities -->
    <!ENTITY agric "agriculture">
    <!ENTITY anat "anatomy">
    <!ENTITY archeol "archeology">
    <!ENTITY archit "architecture">
    <!ENTITY art "art, aesthetics">
    <!ENTITY astron "astronomy">
    <!ENTITY audvid "audiovisual">
    <!ENTITY aviat "aviation">
    <!ENTITY baseb "baseball">
    <!ENTITY biochem "biochemistry">
    <!ENTITY biol "biology">
    <!ENTITY bot "botany">
    <!ENTITY boxing "boxing">
    <!ENTITY Buddh "Buddhism">
    <!ENTITY bus "business">
    <!ENTITY cards "card games">
    <!ENTITY chem "chemistry">
    <!ENTITY chmyth "Chinese mythology">
    <!ENTITY Christn "Christianity">
    <!ENTITY civeng "civil engineering">
    <!ENTITY cloth "clothing">
    <!ENTITY comp "computing">
    <!ENTITY cryst "crystallography">
    <!ENTITY dent "dentistry">
    <!ENTITY ecol "ecology">
    <!ENTITY econ "economics">
    <!ENTITY elec "electricity, elec. eng.">
    <!ENTITY electr "electronics">
    <!ENTITY embryo "embryology">
    <!ENTITY engr "engineering">
    <!ENTITY ent "entomology">
    <!ENTITY figskt "figure skating">
    <!ENTITY film "film">
    <!ENTITY finc "finance">
    <!ENTITY fish "fishing">
    <!ENTITY food "food, cooking">
    <!ENTITY gardn "gardening, horticulture">
    <!ENTITY genet "genetics">
    <!ENTITY geogr "geography">
    <!ENTITY geol "geology">
    <!ENTITY geom "geometry">
    <!ENTITY go "go (game)">
    <!ENTITY golf "golf">
    <!ENTITY gramm "grammar">
    <!ENTITY grmyth "Greek mythology">
    <!ENTITY hanaf "hanafuda">
    <!ENTITY horse "horse racing">
    <!ENTITY internet "Internet">
    <!ENTITY jpmyth "Japanese mythology">
    <!ENTITY kabuki "kabuki">
    <!ENTITY law "law">
    <!ENTITY ling "linguistics">
    <!ENTITY logic "logic">
    <!ENTITY MA "martial arts">
    <!ENTITY mahj "mahjong">
    <!ENTITY manga "manga">
    <!ENTITY math "mathematics">
    <!ENTITY mech "mechanical engineering">
    <!ENTITY med "medicine">
    <!ENTITY met "meteorology">
    <!ENTITY mil "military">
    <!ENTITY min "mineralogy">
    <!ENTITY mining "mining">
    <!ENTITY motor "motorsport">
    <!ENTITY music "music">
    <!ENTITY noh "noh">
    <!ENTITY ornith "ornithology">
    <!ENTITY paleo "paleontology">
    <!ENTITY pathol "pathology">
    <!ENTITY pharm "pharmacology">
    <!ENTITY phil "philosophy">
    <!ENTITY photo "photography">
    <!ENTITY physics "physics">
    <!ENTITY physiol "physiology">
    <!ENTITY politics "politics">
    <!ENTITY print "printing">
    <!ENTITY prowres "professional wrestling">
    <!ENTITY psy "psychiatry">
    <!ENTITY psyanal "psychoanalysis">
    <!ENTITY psych "psychology">
    <!ENTITY rail "railway">
    <!ENTITY rommyth "Roman mythology">
    <!ENTITY Shinto "Shinto">
    <!ENTITY shogi "shogi">
    <!ENTITY ski "skiing">
    <!ENTITY sports "sports">
    <!ENTITY stat "statistics">
    <!ENTITY stockm "stock market">
    <!ENTITY sumo "sumo">
    <!ENTITY surg "surgery">
    <!ENTITY telec "telecommunications">
    <!ENTITY tradem "trademark">
    <!ENTITY tv "television">
    <!ENTITY vet "veterinary terms">
    <!ENTITY vidg "video games">
    <!ENTITY zool "zoology">
    <!-- <ke_inf> (kanji info) entities -->
    <!ENTITY ateji "ateji (phonetic) reading">
    <!ENTITY ik "word containing irregular kana usage">
    <!ENTITY iK "word containing irregular kanji usage">
    <!ENTITY io "irregular okurigana usage">
    <!ENTITY oK "word containing out-dated kanji or kanji usage">
    <!ENTITY rK "rarely used kanji form">
    <!ENTITY sK "search-only kanji form">
    <!-- <misc> (miscellaneous) entities -->
    <!ENTITY abbr "abbreviation">
    <!ENTITY arch "archaic">
    <!ENTITY char "character">
    <!ENTITY chn "children's language">
    <!ENTITY col "colloquial">
    <!ENTITY company "company name">
    <!ENTITY creat "creature">
    <!ENTITY dated "dated term">
    <!ENTITY dei "deity">
    <!ENTITY derog "derogatory">
    <!ENTITY doc "document">
    <!ENTITY euph "euphemistic">
    <!ENTITY ev "event">
    <!ENTITY fam "familiar language">
    <!ENTITY fem "female term or language">
    <!ENTITY fict "fiction">
    <!ENTITY form "formal or literary term">
    <!ENTITY given "given name or forename, gender not specified">
    <!ENTITY group "group">
    <!ENTITY hist "historical term">
    <!ENTITY hon "honorific or respectful (sonkeigo) language">
    <!ENTITY hum "humble (kenjougo) language">
    <!ENTITY id "idiomatic expression">
    <!ENTITY joc "jocular, humorous term">
    <!ENTITY leg "legend">
    <!ENTITY m-sl "manga slang">
    <!ENTITY male "male term or language">
    <!ENTITY myth "mythology">
    <!ENTITY net-sl "Internet slang">
    <!ENTITY obj "object">
    <!ENTITY obs "obsolete term">
    <!ENTITY on-mim "onomatopoeic or mimetic word">
    <!ENTITY organization "organization name">
    <!ENTITY oth "other">
    <!ENTITY person "full name of a particular person">
    <!ENTITY place "place name">
    <!ENTITY poet "poetical term">
    <!ENTITY pol "polite (teineigo) language">
    <!ENTITY product "product name">
    <!ENTITY proverb "proverb">
    <!ENTITY quote "quotation">
    <!ENTITY rare "rare term">
    <!ENTITY relig "religion">
    <!ENTITY sens "sensitive">
    <!ENTITY serv "service">
    <!ENTITY ship "ship name">
    <!ENTITY sl "slang">
    <!ENTITY station "railway station">
    <!ENTITY surname "family or surname">
    <!ENTITY uk "word usually written using kana alone">
    <!ENTITY unclass "unclassified name">
    <!ENTITY vulg "vulgar expression or word">
    <!ENTITY work "work of art, literature, music, etc. name">
    <!ENTITY X "rude or X-rated term (not displayed in educational software)">
    <!ENTITY yoji "yojijukugo">
    <!-- <pos> (part-of-speech) entities -->
    <!ENTITY adj-f "noun or verb acting prenominally">
    <!ENTITY adj-i "adjective (keiyoushi)">
    <!ENTITY adj-ix "adjective (keiyoushi) - yoi/ii class">
    <!ENTITY adj-kari "'kari' adjective (archaic)">
    <!ENTITY adj-ku "'ku' adjective (archaic)">
    <!ENTITY adj-na "adjectival nouns or quasi-adjectives (keiyodoshi)">
    <!ENTITY adj-nari "archaic/formal form of na-adjective">
    <!ENTITY adj-no "nouns which may take the genitive case particle 'no'">
    <!ENTITY adj-pn "pre-noun adjectival (rentaishi)">
    <!ENTITY adj-shiku "'shiku' adjective (archaic)">
    <!ENTITY adj-t "'taru' adjective">
    <!ENTITY adv "adverb (fukushi)">
    <!ENTITY adv-to "adverb taking the 'to' particle">
    <!ENTITY aux "auxiliary">
    <!ENTITY aux-adj "auxiliary adjective">
    <!ENTITY aux-v "auxiliary verb">
    <!ENTITY conj "conjunction">
    <!ENTITY cop "copula">
    <!ENTITY ctr "counter">
    <!ENTITY exp "expressions (phrases, clauses, etc.)">
    <!ENTITY int "interjection (kandoushi)">
    <!ENTITY n "noun (common) (futsuumeishi)">
    <!ENTITY n-adv "adverbial noun (fukushitekimeishi)">
    <!ENTITY n-pr "proper noun">
    <!ENTITY n-pref "noun, used as a prefix">
    <!ENTITY n-suf "noun, used as a suffix">
    <!ENTITY n-t "noun (temporal) (jisoumeishi)">
    <!ENTITY num "numeric">
    <!ENTITY pn "pronoun">
    <!ENTITY pref "prefix">
    <!ENTITY prt "particle">
    <!ENTITY suf "suffix">
    <!ENTITY unc "unclassified">
    <!ENTITY v-unspec "verb unspecified">
    <!ENTITY v1 "Ichidan verb">
    <!ENTITY v1-s "Ichidan verb - kureru special class">
    <!ENTITY v2a-s "Nidan verb with 'u' ending (archaic)">
    <!ENTITY v2b-k "Nidan verb (upper class) with 'bu' ending (archaic)">
    <!ENTITY v2b-s "Nidan verb (lower class) with 'bu' ending (archaic)">
    <!ENTITY v2d-k "Nidan verb (upper class) with 'dzu' ending (archaic)">
    <!ENTITY v2d-s "Nidan verb (lower class) with 'dzu' ending (archaic)">
    <!ENTITY v2g-k "Nidan verb (upper class) with 'gu' ending (archaic)">
    <!ENTITY v2g-s "Nidan verb (lower class) with 'gu' ending (archaic)">
    <!ENTITY v2h-k "Nidan verb (upper class) with 'hu/fu' ending (archaic)">
    <!ENTITY v2h-s "Nidan verb (lower class) with 'hu/fu' ending (archaic)">
    <!ENTITY v2k-k "Nidan verb (upper class) with 'ku' ending (archaic)">
    <!ENTITY v2k-s "Nidan verb (lower class) with 'ku' ending (archaic)">
    <!ENTITY v2m-k "Nidan verb (upper class) with 'mu' ending (archaic)">
    <!ENTITY v2m-s "Nidan verb (lower class) with 'mu' ending (archaic)">
    <!ENTITY v2n-s "Nidan verb (lower class) with 'nu' ending (archaic)">
    <!ENTITY v2r-k "Nidan verb (upper class) with 'ru' ending (archaic)">
    <!ENTITY v2r-s "Nidan verb (lower class) with 'ru' ending (archaic)">
    <!ENTITY v2s-s "Nidan verb (lower class) with 'su' ending (archaic)">
    <!ENTITY v2t-k "Nidan verb (upper class) with 'tsu' ending (archaic)">
    <!ENTITY v2t-s "Nidan verb (lower class) with 'tsu' ending (archaic)">
    <!ENTITY v2w-s "Nidan verb (lower class) with 'u' ending and 'we' conjugation (archaic)">
    <!ENTITY v2y-k "Nidan verb (upper class) with 'yu' ending (archaic)">
    <!ENTITY v2y-s "Nidan verb (lower class) with 'yu' ending (archaic)">
    <!ENTITY v2z-s "Nidan verb (lower class) with 'zu' ending (archaic)">
    <!ENTITY v4b "Yodan verb with 'bu' ending (archaic)">
    <!ENTITY v4g "Yodan verb with 'gu' ending (archaic)">
    <!ENTITY v4h "Yodan verb with 'hu/fu' ending (archaic)">
    <!ENTITY v4k "Yodan verb with 'ku' ending (archaic)">
    <!ENTITY v4m "Yodan verb with 'mu' ending (archaic)">
    <!ENTITY v4n "Yodan verb with 'nu' ending (archaic)">
    <!ENTITY v4r "Yodan verb with 'ru' ending (archaic)">
    <!ENTITY v4s "Yodan verb with 'su' ending (archaic)">
    <!ENTITY v4t "Yodan verb with 'tsu' ending (archaic)">
    <!ENTITY v5aru "Godan verb - -aru special class">
    <!ENTITY v5b "Godan verb with 'bu' ending">
    <!ENTITY v5g "Godan verb with 'gu' ending">
    <!ENTITY v5k "Godan verb with 'ku' ending">
    <!ENTITY v5k-s "Godan verb - Iku/Yuku special class">
    <!ENTITY v5m "Godan verb with 'mu' ending">
    <!ENTITY v5n "Godan verb with 'nu' ending">
    <!ENTITY v5r "Godan verb with 'ru' ending">
    <!ENTITY v5r-i "Godan verb with 'ru' ending (irregular verb)">
    <!ENTITY v5s "Godan verb with 'su' ending">
    <!ENTITY v5t "Godan verb with 'tsu' ending">
    <!ENTITY v5u "Godan verb with 'u' ending">
    <!ENTITY v5u-s "Godan verb with 'u' ending (special class)">
    <!ENTITY v5uru "Godan verb - Uru old class verb (old form of Eru)">
    <!ENTITY vi "intransitive verb">
    <!ENTITY vk "Kuru verb - special class">
    <!ENTITY vn "irregular nu verb">
    <!ENTITY vr "irregular ru verb, plain form ends with -ri">
    <!ENTITY vs "noun or participle which takes the aux. verb suru">
    <!ENTITY vs-c "su verb - precursor to the modern suru">
    <!ENTITY vs-i "suru verb - included">
    <!ENTITY vs-s "suru verb - special class">
    <!ENTITY vt "transitive verb">
    <!ENTITY vz "Ichidan verb - zuru verb (alternative form of -jiru verbs)">
    <!-- <re_inf> (reading info) entities -->
    <!ENTITY gikun "gikun (meaning as reading) or jukujikun (special kanji reading)">
    <!ENTITY ik "word containing irregular kana usage">
    <!ENTITY ok "out-dated or obsolete kana usage">
    <!ENTITY rk "rarely used kana form">
    <!ENTITY sk "search-only kana form">
        ]>
    <!-- JMdict created: 2024-02-15 -->
    <JMdict>
      ${entryData}
      <entry>
        <ent_seq>9999999</ent_seq>
        <k_ele>
          <keb>ＪＭｄｉｃｔ</keb>
        </k_ele>
        <r_ele>
          <reb>ジェイエムディクト</reb>
        </r_ele>
        <sense>
          <pos>&unc;</pos>
          <gloss>Japanese-Multilingual Dictionary Project - Creation Date: 2024-02-15</gloss>
        </sense>
      </entry>
    </JMdict>
    `;
  }
});
