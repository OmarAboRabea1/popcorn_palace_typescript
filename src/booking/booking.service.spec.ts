import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { Showtime } from '../showtime/entities/showtime.entity';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/booking.dto';
import { bookedIdExample, sampleBooking, sampleBookingResult, sampleShowtime, userIdExample } from '../../src/testsSamples';

describe('BookingService', () => {
    let service: BookingService;
    let bookingRepo: jest.Mocked<Repository<Booking>>;
    let showtimeRepo: jest.Mocked<Repository<Showtime>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BookingService,
                {
                    provide: getRepositoryToken(Booking),
                    useValue: {
                        findOne: jest.fn(),
                        find: jest.fn(),
                        save: jest.fn(),
                        remove: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Showtime),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<BookingService>(BookingService);
        bookingRepo = module.get(getRepositoryToken(Booking));
        showtimeRepo = module.get(getRepositoryToken(Showtime));
    });

    describe('createBooking', () => {
        it('should throw if showtime not found', async () => {
            showtimeRepo.findOne.mockResolvedValue(null);

            await expect(
                service.createBooking({
                    showtimeId: 1,
                    seatNumber: 5,
                    userId: userIdExample,
                } as unknown as CreateBookingDto),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw if seat is already booked', async () => {
            showtimeRepo.findOne.mockResolvedValue(sampleShowtime);
            bookingRepo.findOne.mockResolvedValue(sampleBooking);

            await expect(
                service.createBooking({
                    showtimeId: 1,
                    seatNumber: 5,
                    userId: userIdExample,
                } as unknown as CreateBookingDto),
            ).rejects.toThrow(ConflictException);
        });

        it('should create and return new booking', async () => {
            showtimeRepo.findOne.mockResolvedValue(sampleShowtime);
            bookingRepo.findOne.mockResolvedValue(null);
            bookingRepo.create.mockReturnValue(sampleBooking);
            bookingRepo.save.mockResolvedValue(sampleBooking as Booking);

            const result = await service.createBooking({
                showtimeId: 1,
                seatNumber: 5,
                userId: userIdExample,
            } as unknown as CreateBookingDto);

            expect(result).toEqual(sampleBookingResult);
        });
    });

    describe('getBookingById', () => {
        it('should return booking if found', async () => {
            bookingRepo.findOne.mockResolvedValue(sampleBooking as Booking);
            const result = await service.getBookingById(bookedIdExample);
            expect(result).toEqual(sampleBooking);
        });

        it('should throw if booking not found', async () => {
            bookingRepo.findOne.mockResolvedValue(null);
            await expect(service.getBookingById(bookedIdExample)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getBookingsForShowtime', () => {
        it('should return all bookings for a showtime', async () => {
            bookingRepo.find.mockResolvedValue([sampleBooking as Booking]);
            const result = await service.getBookingsForShowtime(1);
            expect(result.length).toBe(1);
        });
    });

    describe('cancelBooking', () => {
        it('should delete booking by id', async () => {
            bookingRepo.findOne.mockResolvedValue(sampleBooking as Booking);
            bookingRepo.remove.mockResolvedValue(sampleBooking as Booking);

            await expect(service.cancelBooking(bookedIdExample)).resolves.toBeUndefined();
            expect(bookingRepo.remove).toHaveBeenCalledWith(sampleBooking);
        });

        it('should throw if booking not found', async () => {
            bookingRepo.findOne.mockResolvedValue(null);
            await expect(service.cancelBooking(bookedIdExample)).rejects.toThrow(NotFoundException);
        });
    });
});
