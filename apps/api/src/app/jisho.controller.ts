import { Controller, Get, Param } from '@nestjs/common';

import { JishoService } from './jisho.service';

@Controller('jisho')
export class JishoController {
  constructor(private readonly service: JishoService) {}

  @Get(':word')
  getRandomGame(@Param('word') word: string) {
    return this.service.getWord(word);
  }
}
