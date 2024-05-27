import { Test, TestingModule } from '@nestjs/testing';

import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [GameController],
      providers: [GameService],
    }).compile();
  });

  describe('getRandomGame', () => {
    it('should return "Hello API"', async () => {
      const controller = app.get<GameController>(GameController);
      const data = await controller.getRandomGame();
      expect(data).toHaveProperty('k');
      expect(data).toHaveProperty('w');
    });
  });
});
