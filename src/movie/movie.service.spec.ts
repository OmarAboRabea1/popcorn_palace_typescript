import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { sampleMovie } from '../../src/testsSamples';

describe('MovieService', () => {
  let movieService: MovieService;
  let MovieRepo: Repository<Movie>;

  const mockMovieRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
      ],
    }).compile();

    movieService = module.get<MovieService>(MovieService);
    MovieRepo = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMovie', () => {
    it('should create a movie', async () => {
      mockMovieRepository.create.mockReturnValue(sampleMovie);
      mockMovieRepository.save.mockResolvedValue(sampleMovie);

      const result = await movieService.createMovie(sampleMovie);
      expect(result).toEqual(sampleMovie);
      expect(mockMovieRepository.create).toHaveBeenCalledWith(sampleMovie);
      expect(mockMovieRepository.save).toHaveBeenCalledWith(sampleMovie);
    });
  });

  describe('getAllMovies', () => {
    it('should return all movies', async () => {
      mockMovieRepository.find.mockResolvedValue([sampleMovie]);

      const result = await movieService.getAllMovies();
      expect(result).toEqual([sampleMovie]);
      expect(mockMovieRepository.find).toHaveBeenCalled();
    });
  });

  describe('getMovieById', () => {
    it('should return a movie by ID', async () => {
      mockMovieRepository.findOne.mockResolvedValue(sampleMovie);

      const result = await movieService.getMovieById(1);
      expect(result).toEqual(sampleMovie);
    });

    it('should throw if movie not found by ID', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(movieService.getMovieById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMovieByTitle', () => {
    it('should update movie by title', async () => {
      mockMovieRepository.findOne.mockResolvedValue(sampleMovie);
      mockMovieRepository.update.mockResolvedValue({});
      const updated = { ...sampleMovie, title: 'Interstellar' };

      await movieService.updateMovieByTitle('Inception', updated);
      expect(mockMovieRepository.update).toHaveBeenCalledWith({ title: 'Inception' }, updated);
    });

    it('should throw if movie not found by title on update', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(
        movieService.updateMovieByTitle('NonExistent', { title: 'Updated' } as any),
      ).rejects.toThrow(NotFoundException);
      expect(mockMovieRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteMovieByTitle', () => {
    it('should delete movie by title', async () => {
      mockMovieRepository.findOne.mockResolvedValue(sampleMovie);
      mockMovieRepository.delete.mockResolvedValue({});

      await movieService.deleteMovieByTitle('Inception');
      expect(mockMovieRepository.delete).toHaveBeenCalledWith({ title: 'Inception' });
    });

    it('should throw if movie not found by title on delete', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(
        movieService.deleteMovieByTitle('NonExistent'),
      ).rejects.toThrow(NotFoundException);
      expect(mockMovieRepository.delete).not.toHaveBeenCalled();
    });
  });
});
