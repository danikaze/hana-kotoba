import { Module } from '@nestjs/common';

import { GameController } from './game.controller';
import { GameService } from './game.service';
import { JishoController } from './jisho.controller';
import { JishoService } from './jisho.service';

@Module({
  imports: [],
  controllers: [GameController, JishoController],
  providers: [GameService, JishoService],
})
export class AppModule {}
