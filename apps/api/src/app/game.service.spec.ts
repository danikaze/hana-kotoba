import { Test } from '@nestjs/testing';

import { GameService } from './game.service';

describe('GameService', () => {
  let service: GameService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      providers: [GameService],
    }).compile();

    service = app.get<GameService>(GameService);
  });

  describe('getRandomGame', () => {
    it('should return the data for a random game', async () => {
      const data = await service.getRandomGame();
      expect(data).toHaveProperty('k');
      expect(data).toHaveProperty('w');
    });
  });
});
