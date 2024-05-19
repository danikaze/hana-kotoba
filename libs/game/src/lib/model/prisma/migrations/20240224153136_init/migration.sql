-- CreateTable
CREATE TABLE "Meta" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entSeq" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictKanji" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "kanji" TEXT NOT NULL,
    CONSTRAINT "JmDictKanji_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JmDictEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictReading" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    "reading" TEXT NOT NULL,
    CONSTRAINT "JmDictReading_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JmDictEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictSense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "entryId" INTEGER NOT NULL,
    CONSTRAINT "JmDictSense_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JmDictEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictGloss" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senseId" INTEGER NOT NULL,
    "text" TEXT,
    "lang" TEXT NOT NULL,
    "type" TEXT,
    CONSTRAINT "JmDictGloss_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictGloss_lang_fkey" FOREIGN KEY ("lang") REFERENCES "JmDictLang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictGloss_type_fkey" FOREIGN KEY ("type") REFERENCES "JmDictGlossType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictAntonym" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senseId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "JmDictAntonym_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictCrossReference" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senseId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "JmDictCrossReference_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictLanguageSource" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "senseId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "text" TEXT,
    "wasei" BOOLEAN,
    "type" TEXT,
    CONSTRAINT "JmDictLanguageSource_senseId_fkey" FOREIGN KEY ("senseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictLanguageSource_lang_fkey" FOREIGN KEY ("lang") REFERENCES "JmDictLang" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictLanguageSource_type_fkey" FOREIGN KEY ("type") REFERENCES "JmDictLanguageSourceType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictLanguageSourceType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictMisc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictSensePos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictDialect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictReadingInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictKanjiInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictSenseField" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictLang" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "englishName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictPriority" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictGlossType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "meaning" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "JmDictMiscOnJmDictSense" (
    "jmDictSenseId" INTEGER NOT NULL,
    "jmDictMiscId" TEXT NOT NULL,

    PRIMARY KEY ("jmDictMiscId", "jmDictSenseId"),
    CONSTRAINT "JmDictMiscOnJmDictSense_jmDictSenseId_fkey" FOREIGN KEY ("jmDictSenseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictMiscOnJmDictSense_jmDictMiscId_fkey" FOREIGN KEY ("jmDictMiscId") REFERENCES "JmDictMisc" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictSensePosOnJmDictSense" (
    "jmDictSensePosId" TEXT NOT NULL,
    "jmDictSenseId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictSensePosId", "jmDictSenseId"),
    CONSTRAINT "JmDictSensePosOnJmDictSense_jmDictSensePosId_fkey" FOREIGN KEY ("jmDictSensePosId") REFERENCES "JmDictSensePos" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictSensePosOnJmDictSense_jmDictSenseId_fkey" FOREIGN KEY ("jmDictSenseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictDialectOnJmDictSense" (
    "jmDictDialectId" TEXT NOT NULL,
    "jmDictSenseId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictDialectId", "jmDictSenseId"),
    CONSTRAINT "JmDictDialectOnJmDictSense_jmDictDialectId_fkey" FOREIGN KEY ("jmDictDialectId") REFERENCES "JmDictDialect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictDialectOnJmDictSense_jmDictSenseId_fkey" FOREIGN KEY ("jmDictSenseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictReadingInfoOnJmDictReading" (
    "jmDictReadingInfoId" TEXT NOT NULL,
    "jmDictReadingId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictReadingInfoId", "jmDictReadingId"),
    CONSTRAINT "JmDictReadingInfoOnJmDictReading_jmDictReadingInfoId_fkey" FOREIGN KEY ("jmDictReadingInfoId") REFERENCES "JmDictReadingInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictReadingInfoOnJmDictReading_jmDictReadingId_fkey" FOREIGN KEY ("jmDictReadingId") REFERENCES "JmDictReading" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictPrioritiesOnJmDictReading" (
    "jmDictPriorityId" TEXT NOT NULL,
    "jmDictReadingId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictPriorityId", "jmDictReadingId"),
    CONSTRAINT "JmDictPrioritiesOnJmDictReading_jmDictPriorityId_fkey" FOREIGN KEY ("jmDictPriorityId") REFERENCES "JmDictPriority" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictPrioritiesOnJmDictReading_jmDictReadingId_fkey" FOREIGN KEY ("jmDictReadingId") REFERENCES "JmDictReading" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictKanjiInfoOnJmDictKanji" (
    "jmDictKanjiInfoId" TEXT NOT NULL,
    "jmDictKanjiId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictKanjiInfoId", "jmDictKanjiId"),
    CONSTRAINT "JmDictKanjiInfoOnJmDictKanji_jmDictKanjiInfoId_fkey" FOREIGN KEY ("jmDictKanjiInfoId") REFERENCES "JmDictKanjiInfo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictKanjiInfoOnJmDictKanji_jmDictKanjiId_fkey" FOREIGN KEY ("jmDictKanjiId") REFERENCES "JmDictKanji" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictPrioritiesOnJmDictKanji" (
    "jmDictPriorityId" TEXT NOT NULL,
    "jmDictKanjiId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictPriorityId", "jmDictKanjiId"),
    CONSTRAINT "JmDictPrioritiesOnJmDictKanji_jmDictPriorityId_fkey" FOREIGN KEY ("jmDictPriorityId") REFERENCES "JmDictPriority" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictPrioritiesOnJmDictKanji_jmDictKanjiId_fkey" FOREIGN KEY ("jmDictKanjiId") REFERENCES "JmDictKanji" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JmDictSenseFieldOnJmDictSense" (
    "jmDictSenseFieldId" TEXT NOT NULL,
    "jmDictSenseId" INTEGER NOT NULL,

    PRIMARY KEY ("jmDictSenseFieldId", "jmDictSenseId"),
    CONSTRAINT "JmDictSenseFieldOnJmDictSense_jmDictSenseFieldId_fkey" FOREIGN KEY ("jmDictSenseFieldId") REFERENCES "JmDictSenseField" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "JmDictSenseFieldOnJmDictSense_jmDictSenseId_fkey" FOREIGN KEY ("jmDictSenseId") REFERENCES "JmDictSense" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "JmDictEntry_entSeq_key" ON "JmDictEntry"("entSeq");
