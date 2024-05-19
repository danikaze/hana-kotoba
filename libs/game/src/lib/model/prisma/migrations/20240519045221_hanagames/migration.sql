-- CreateTable
CREATE TABLE "HanaGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" INTEGER NOT NULL,
    "chars" TEXT NOT NULL,
    "serializedMatrix" TEXT NOT NULL,
    "encodedMatrix" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "HanaGameWords" (
    "word" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    PRIMARY KEY ("gameId", "word"),
    CONSTRAINT "HanaGameWords_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "HanaGame" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
