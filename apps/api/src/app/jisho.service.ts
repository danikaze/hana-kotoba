import { Injectable } from '@nestjs/common';
import { formatTime } from '@utils/format';
import { JishoModel, JishoWord } from '@jmdict/model';

@Injectable()
export class JishoService {
  private jishoModel = new JishoModel();

  public async getWord(word: string): Promise<JishoWord[]> {
    const t0 = Date.now();
    const data = await this.jishoModel.getWord(word);
    const ellapsedTime = Date.now() - t0;

    if (process.env.NODE_ENV !== 'production') {
      print(word, data, ellapsedTime);
    }

    return data;
  }
}

function print(word: string, data: JishoWord[], time?: number): void {
  console.log(`getWord("${word}"): ${time ? formatTime(time) : ''}`);
}
