import { Injectable } from '@nestjs/common';

import { getGameData } from '@game';
import { findMatrixWords } from '@game/find-matrix-words';
import { serializeMatrixWords } from '@game/matrix-words';
import { Matrix2D } from '@utils/matrix-2d';

@Injectable()
export class AppService {
  getData() {
    const data = getGameData();

    if (!data) return;

    print(data.matrix);

    return {
      k: data.kanas,
      w: serializeMatrixWords(
        findMatrixWords(data.matrix),
        process.env.NODE_ENV === 'production'
      ),
    };
  }
}

function print(matrix: Readonly<Matrix2D<string>>): void {
  console.log(
    `---[${matrix.width()}x${matrix.height()}]---\n` +
      matrix
        .toArray()
        .map((row) => row.map((c) => c || '　').join(''))
        .join('\n')
  );
}
