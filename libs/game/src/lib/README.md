# Game

Contains the _logic_ of the game (provide access to words, combinations, and checking if a solution is valid or not, etc.)

[data.json](./data.json) is the output from processing the edict file via [JMDictProcessor](../../../../apps/edict/src/jmedict-processor/index.ts), so words and combinations can be found.

This data gets read by [getIndexedData](./indexed-data.ts) (which applies some indexing on it) and used when getting words by the API.

Better data organization (pre-processing into matrices, etc.) will be needed in future versions.
