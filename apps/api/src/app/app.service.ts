import { Injectable } from '@nestjs/common';
import { getGameData } from '@game';
import { encodeBinaryMatrix } from '@utils/binary-matrix';

@Injectable()
export class AppService {
  getData() {
    const data = getGameData();

    if (!data) return;

    return {
      kanas: data.kanas,
      words: data.words,
      matrix: encodeBinaryMatrix(data.matrix, (char) => char !== ''),
    };
  }
}
