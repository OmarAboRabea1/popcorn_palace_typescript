import { Test, TestingModule } from '@nestjs/testing';
import { ShowtimeService } from './showtime.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from './entities/showtime.entity';
import { Movie } from '../movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { ConflictException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';
import { sampleMovie, sampleShowtime, sampleShowtimeResult } from '../../src/testsSamples';

describe('ShowtimeService', () => {
    let service: ShowtimeService;
    let showtimeRepo: Repository<Showtime>;
    let movieRepo: Repository<Movie>;

    const mockShowtimeRepo = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        merge: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            getOne: jest.fn(),
        })),
    };

    const mockMovieRepo = {
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        // Suppress expected logger errors during tests
        jest.spyOn(Logger.prototype, 'error').mockImplementation((message) => {
            if (
                typeof message === 'string' &&
                (
                    message.includes('not found') ||
                    message.includes('overlaps') ||
                    message.includes('Failed to') ||
                    message.includes('already exists')
                )
            ) {
                return;
            }
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ShowtimeService,
                { provide: getRepositoryToken(Showtime), useValue: mockShowtimeRepo },
                { provide: getRepositoryToken(Movie), useValue: mockMovieRepo },
            ],
        }).compile();

        service = module.get<ShowtimeService>(ShowtimeService);
        showtimeRepo = module.get(getRepositoryToken(Showtime));
        movieRepo = module.get(getRepositoryToken(Movie));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createShowtime', () => {

        const dto: CreateShowtimeDto = {
            movieId: 1,
            price: 20,
            theater: 'A',
            startTime: new Date(),
            endTime: new Date(),
        };

        it('should throw if movie is not found', async () => {
            mockMovieRepo.findOne.mockResolvedValue(null);
            const dto = { movieId: 1, price: 20, theater: 'A', startTime: new Date(), endTime: new Date() };
            await expect(service.createShowtime(dto as CreateShowtimeDto)).rejects.toThrow(NotFoundException);
        });

        it('should throw conflict if overlapping showtime exists', async () => {
            mockMovieRepo.findOne.mockResolvedValue(sampleMovie);

            // Fully mock query builder chain to return overlapping showtime
            mockShowtimeRepo.createQueryBuilder = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(sampleShowtime),
            });

            await expect(service.createShowtime(dto)).rejects.toThrow(ConflictException);
        });


        it('should save and return new showtime', async () => {
            mockMovieRepo.findOne.mockResolvedValue(sampleMovie);
            mockShowtimeRepo.createQueryBuilder().getOne.mockResolvedValue(null);
            mockShowtimeRepo.create.mockReturnValue(sampleShowtime);
            mockShowtimeRepo.save.mockResolvedValue(sampleShowtime);

            const dto = { movieId: 1, price: 20, theater: 'A', startTime: new Date(), endTime: new Date() };
            const result = await service.createShowtime(dto as CreateShowtimeDto);

            expect(result).toEqual(sampleShowtimeResult);
            expect(mockShowtimeRepo.save).toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException if unexpected error occurs', async () => {
            // Simulate unexpected error (e.g., DB crash)
            mockMovieRepo.findOne.mockResolvedValue(sampleMovie);
            mockShowtimeRepo.createQueryBuilder = jest.fn().mockReturnValue({
                where: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                getOne: jest.fn().mockResolvedValue(null),
            });
            mockShowtimeRepo.create.mockReturnValue(sampleShowtime);
            mockShowtimeRepo.save.mockRejectedValue(new Error('DB failure'));

            await expect(service.createShowtime(dto)).rejects.toThrow(InternalServerErrorException);
        });

    });

    describe('getShowtimeById', () => {
        it('should return showtime by id', async () => {
            mockShowtimeRepo.findOne.mockResolvedValue(sampleShowtime);
            const result = await service.getShowtimeById(1);
            expect(result).toEqual(sampleShowtimeResult);
        });

        it('should throw if showtime not found', async () => {
            mockShowtimeRepo.findOne.mockResolvedValue(null);
            await expect(service.getShowtimeById(2)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAllShowtimes', () => {
        it('should return all showtimes', async () => {
            mockShowtimeRepo.find.mockResolvedValue([sampleShowtime]);
            const result = await service.getAllShowtimes();
            expect(result).toEqual([sampleShowtime]);
        });

        it('should throw InternalServerErrorException if find fails', async () => {
            mockShowtimeRepo.find.mockRejectedValue(new Error('DB failure'));
            await expect(service.getAllShowtimes()).rejects.toThrow(InternalServerErrorException);
            expect(mockShowtimeRepo.find).toHaveBeenCalled();
        });
    });

    describe('updateShowtime', () => {
        it('should update showtime and return updated version', async () => {
            mockShowtimeRepo.findOne.mockResolvedValueOnce(sampleShowtime); // fetch original
            mockShowtimeRepo.merge.mockReturnValue({ ...sampleShowtime, price: 80 }); // simulate merge
            mockShowtimeRepo.save.mockResolvedValue({ ...sampleShowtime, price: 80 }); // simulate save

            const result = await service.updateShowtime(1, { price: 80 } as UpdateShowtimeDto);

            expect(result.price).toBe(80);
            expect(mockShowtimeRepo.merge).toHaveBeenCalled();
            expect(mockShowtimeRepo.save).toHaveBeenCalled();
        });

        it('should throw if showtime is not found', async () => {
            mockShowtimeRepo.findOne.mockResolvedValueOnce(null); // no showtime

            await expect(
                service.updateShowtime(1, { movieId: 1, price: 80 } as UpdateShowtimeDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw if movie is not found', async () => {
            mockShowtimeRepo.findOne.mockResolvedValueOnce(sampleShowtime); // valid showtime
            mockMovieRepo.findOne.mockResolvedValue(null); // no movie

            await expect(
                service.updateShowtime(1, { movieId: 99, price: 80 } as UpdateShowtimeDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if saving fails unexpectedly', async () => {
            mockShowtimeRepo.findOne.mockResolvedValueOnce(sampleShowtime); // showtime exists
            mockMovieRepo.findOne.mockResolvedValue(sampleMovie); // movie exists

            mockShowtimeRepo.merge.mockReturnValue({ ...sampleShowtime, price: 99 });
            mockShowtimeRepo.save.mockRejectedValue(new Error('Unexpected DB error'));

            await expect(
                service.updateShowtime(1, { movieId: sampleMovie.id, price: 99 } as UpdateShowtimeDto),
            ).rejects.toThrow(InternalServerErrorException);
        });
    });


    describe('deleteShowtime', () => {
        it('should delete showtime', async () => {
            mockShowtimeRepo.findOne.mockResolvedValue(sampleShowtime);
            mockShowtimeRepo.delete.mockResolvedValue(undefined);
            await expect(service.deleteShowtime(1)).resolves.not.toThrow();
        });

        it('should throw if showtime not found', async () => {
            mockShowtimeRepo.findOne.mockResolvedValue(null);
            await expect(service.deleteShowtime(999)).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException if deletion fails unexpectedly', async () => {
            mockShowtimeRepo.findOne.mockResolvedValue(sampleShowtime);
            mockShowtimeRepo.delete.mockRejectedValue(new Error('Unexpected delete failure'));

            await expect(service.deleteShowtime(1)).rejects.toThrow(InternalServerErrorException);
        });

    });
});
