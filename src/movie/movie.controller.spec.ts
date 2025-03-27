import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from './movie.controller';
import { MovieService } from './movie.service';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { NotFoundException } from '@nestjs/common';
import { sampleMovie } from '../../src/testsSamples';

describe('MovieController', () => {
  let controller: MovieController;
  let service: MovieService;

  const mockMovieService = {
    createMovie: jest.fn(),
    getAllMovies: jest.fn(),
    getMovieById: jest.fn(),
    updateMovieByTitle: jest.fn(),
    deleteMovieByTitle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        {
          provide: MovieService,
          useValue: mockMovieService,
        },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get<MovieService>(MovieService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovie', () => {
    it('should create a new movie', async () => {
      mockMovieService.createMovie.mockResolvedValue(sampleMovie);
      const result = await controller.createMovie(sampleMovie as CreateMovieDto);
      expect(result).toEqual(sampleMovie);
    });
  });

  describe('getAllMovies', () => {
    it('should return a list of movies', async () => {
      mockMovieService.getAllMovies.mockResolvedValue([sampleMovie]);
      const result = await controller.getAllMovies();
      expect(result).toEqual([sampleMovie]);
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by id', async () => {
      mockMovieService.getMovieById.mockResolvedValue(sampleMovie);
      const result = await controller.getMovieById(1);
      expect(result).toEqual(sampleMovie);
    });

    it('should throw NotFound if movie is not found', async () => {
      mockMovieService.getMovieById.mockRejectedValue(new NotFoundException());

      await expect(controller.getMovieById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMovieByTitle', () => {
    it('should update a movie by title', async () => {
      mockMovieService.updateMovieByTitle.mockResolvedValue(undefined);
      await expect(controller.updateMovieByTitle('Inception', sampleMovie as UpdateMovieDto)).resolves.not.toThrow();
      expect(mockMovieService.updateMovieByTitle).toHaveBeenCalledWith('Inception', sampleMovie);
    });

    it('should throw NotFound if movie to update is not found', async () => {
      mockMovieService.updateMovieByTitle.mockRejectedValue(new NotFoundException());

      await expect(
        controller.updateMovieByTitle('NonExistent', { title: 'Updated' } as UpdateMovieDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteMovieByTitle', () => {
    it('should delete a movie by title', async () => {
      mockMovieService.deleteMovieByTitle.mockResolvedValue(undefined);
      await expect(controller.deleteMovieByTitle('Inception')).resolves.not.toThrow();
      expect(mockMovieService.deleteMovieByTitle).toHaveBeenCalledWith('Inception');
    });

    it('should throw NotFound if movie to delete is not found', async () => {
      mockMovieService.deleteMovieByTitle.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteMovieByTitle('NonExistent')).rejects.toThrow(NotFoundException);
    });
  });
});
