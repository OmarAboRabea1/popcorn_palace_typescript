import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeController } from './showtime.controller';
import { ShowtimeService } from './showtime.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';
import { sampleMovie, sampleShowtime, sampleShowtimeResult } from '../../src/testsSamples';

describe('ShowtimeController', () => {
  let controller: ShowtimeController;
  let service: ShowtimeService;

  const mockShowtimeService = {
    createShowtime: jest.fn(),
    getShowtimeById: jest.fn(),
    getAllShowtimes: jest.fn(),
    updateShowtime: jest.fn(),
    deleteShowtime: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowtimeController],
      providers: [
        {
          provide: ShowtimeService,
          useValue: mockShowtimeService,
        },
      ],
    }).compile();

    controller = module.get<ShowtimeController>(ShowtimeController);
    service = module.get<ShowtimeService>(ShowtimeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createShowtime', () => {
    it('should create a new showtime', async () => {
      mockShowtimeService.createShowtime.mockResolvedValue(sampleShowtimeResult);

      const dto: CreateShowtimeDto = {
        movieId: 1,
        theater: 'IMAX',
        price: 50.5,
        startTime: new Date(),
        endTime: new Date(),
      };

      const result = await controller.createShowtime(dto);
      expect(result).toEqual(sampleShowtimeResult);
    });

    it('should throw conflict if overlapping showtime exists', async () => {
      mockShowtimeService.createShowtime.mockRejectedValue(new ConflictException());

      await expect(controller.createShowtime({} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('getShowtimeById', () => {
    it('should return showtime by id', async () => {
      mockShowtimeService.getShowtimeById.mockResolvedValue(sampleShowtimeResult);
      const result = await controller.getShowtimeById(1);
      expect(result).toEqual(sampleShowtimeResult);
    });

    it('should throw if not found', async () => {
      mockShowtimeService.getShowtimeById.mockRejectedValue(new NotFoundException());
      await expect(controller.getShowtimeById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllShowtimes', () => {
    it('should return all showtimes', async () => {
      mockShowtimeService.getAllShowtimes.mockResolvedValue([sampleShowtimeResult]);
      const result = await controller.getAllShowtimes();
      expect(result).toEqual([sampleShowtimeResult]);
    });
  });

  describe('updateShowtime', () => {
    it('should update showtime', async () => {
      mockShowtimeService.updateShowtime.mockResolvedValue(sampleShowtimeResult);
      const result = await controller.updateShowtime(1, { price: 55, movieId: 1 } as UpdateShowtimeDto);
      expect(result).toEqual(sampleShowtimeResult);
    });

    it('should throw if not found', async () => {
      mockShowtimeService.updateShowtime.mockRejectedValue(new NotFoundException());
      await expect(controller.updateShowtime(1, { movieId: 1 } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteShowtime', () => {
    it('should delete a showtime', async () => {
      mockShowtimeService.deleteShowtime.mockResolvedValue(undefined);
      await expect(controller.deleteShowtime(1)).resolves.not.toThrow();
      expect(mockShowtimeService.deleteShowtime).toHaveBeenCalledWith(1);
    });

    it('should throw if showtime not found', async () => {
      mockShowtimeService.deleteShowtime.mockRejectedValue(new NotFoundException());
      await expect(controller.deleteShowtime(1)).rejects.toThrow(NotFoundException);
    });
  });
});
