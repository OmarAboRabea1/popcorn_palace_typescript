import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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
        // Suppress expected logger errors
        jest.spyOn(Logger.prototype, 'error').mockImplementation((message, stack, context) => {
            if (
                typeof message === 'string' &&
                (
                    message.includes('not found') ||
                    message.includes('already exists')
                )
            ) {
                return;
            }
        });

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

        it('should throw ConflictException if movie with title already exists', async () => {
            mockMovieRepository.findOne.mockResolvedValue(sampleMovie); // Simulate existing movie

            await expect(movieService.createMovie(sampleMovie)).rejects.toThrow(ConflictException);
            expect(mockMovieRepository.findOne).toHaveBeenCalledWith({ where: { title: sampleMovie.title } });
            expect(mockMovieRepository.create).not.toHaveBeenCalled();
            expect(mockMovieRepository.save).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException if save fails', async () => {
            mockMovieRepository.findOne.mockResolvedValue(null);
            mockMovieRepository.create.mockReturnValue(sampleMovie);
            mockMovieRepository.save.mockRejectedValue(new Error('Database save failed'));

            await expect(movieService.createMovie(sampleMovie)).rejects.toThrow(InternalServerErrorException);
            expect(mockMovieRepository.save).toHaveBeenCalled();
        });
    });

    describe('getAllMovies', () => {
        it('should return all movies', async () => {
            mockMovieRepository.find.mockResolvedValue([sampleMovie]);

            const result = await movieService.getAllMovies();
            expect(result).toEqual([sampleMovie]);
            expect(mockMovieRepository.find).toHaveBeenCalled();
        });
        it('should throw InternalServerErrorException if find fails', async () => {
            mockMovieRepository.find.mockRejectedValue(new Error('Database query error'));

            await expect(movieService.getAllMovies()).rejects.toThrow(InternalServerErrorException);
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

        it('should throw InternalServerErrorException if update fails', async () => {
            mockMovieRepository.findOne.mockResolvedValue(sampleMovie);
            mockMovieRepository.update.mockRejectedValue(new Error('Update failed'));

            await expect(
                movieService.updateMovieByTitle('Inception', { title: 'Updated' } as any),
            ).rejects.toThrow(InternalServerErrorException);

            expect(mockMovieRepository.update).toHaveBeenCalled();
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

        it('should throw InternalServerErrorException if deletion fails', async () => {
            mockMovieRepository.findOne.mockResolvedValue(sampleMovie);
            mockMovieRepository.delete.mockRejectedValue(new Error('Delete failed'));

            await expect(
                movieService.deleteMovieByTitle('Inception'),
            ).rejects.toThrow(InternalServerErrorException);

            expect(mockMovieRepository.delete).toHaveBeenCalledWith({ title: 'Inception' });
        });
    });
});
