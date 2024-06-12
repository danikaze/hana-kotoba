import { Injectable } from '@nestjs/common';

import { formatTime } from '@utils/format';
import { HanaGameModel } from '@game/model';
import {
  deserializeMatrixWords,
  matrixFromPositionedWords,
} from '@game/matrix-words';
import { JishoModel, JishoWord } from '@jmdict/model';

@Injectable()
export class GameService {
  private gameModel = new HanaGameModel();
  private jishoModel = new JishoModel();

  public async getRandomGame() {
    const t0 = Date.now();
    const data = await this.gameModel.readRandomGame();
    const ellapsedTime = Date.now() - t0;

    print(data.serializedMatrix, ellapsedTime);

    return {
      k: data.chars,
      w:
        process.env.NODE_ENV === 'production'
          ? data.encodedMatrix
          : data.serializedMatrix,
    };
  }

  public async getWord(word: string): Promise<JishoWord[]> {
    const t0 = Date.now();
    const data = await this.jishoModel.getWord(word);
    const ellapsedTime = Date.now() - t0;

    console.log(`getWord: ${formatTime(ellapsedTime)}`);

    return data;
  }
}

function print(serializedMatrix: string, time?: number): void {
  if (process.env.NODE_ENV === 'production') return;

  const words = deserializeMatrixWords(serializedMatrix);
  const matrix = matrixFromPositionedWords(words);
  const t = time ? ` (${formatTime(time)})` : '';

  console.log(
    `---[${matrix.width()}x${matrix.height()}]---${t}\n` +
      matrix
        .toArray()
        .map((row) => row.map((c) => c || '　').join(''))
        .join('\n')
  );
}
