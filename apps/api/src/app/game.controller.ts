import { Controller, Get } from '@nestjs/common';

import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly service: GameService) {}

  @Get()
  getRandomGame() {
    return this.service.getRandomGame();
  }
}
