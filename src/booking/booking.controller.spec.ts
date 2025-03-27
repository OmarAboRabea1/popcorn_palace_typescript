import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateBookingDto } from './dto/booking.dto';
import {
  sampleBooking,
  sampleBookingResult,
  userIdExample,
  bookedIdExample,
  sampleShowtime,
} from '../../src/testsSamples';

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBookingService = {
    createBooking: jest.fn(),
    getBookingById: jest.fn(),
    getBookingsForShowtime: jest.fn(),
    cancelBooking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a new booking', async () => {
      mockBookingService.createBooking.mockResolvedValue(sampleBookingResult);

      const dto: CreateBookingDto = {
        showtimeId: sampleShowtime.id,
        seatNumber: sampleBooking.seatNumber,
        userId: userIdExample,
      };

      const result = await controller.createBooking(dto);
      expect(result).toEqual(sampleBookingResult);
    });

    it('should throw conflict if seat already booked', async () => {
      mockBookingService.createBooking.mockRejectedValue(new ConflictException());

      await expect(controller.createBooking({} as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('getBookingById', () => {
    it('should return booking if found', async () => {
      mockBookingService.getBookingById.mockResolvedValue(sampleBooking);
      const result = await controller.getBookingById(bookedIdExample);
      expect(result).toEqual(sampleBooking);
    });

    it('should throw if booking not found', async () => {
      mockBookingService.getBookingById.mockRejectedValue(new NotFoundException());
      await expect(controller.getBookingById(bookedIdExample)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getBookingsForShowtime', () => {
    it('should return list of bookings for a showtime', async () => {
      mockBookingService.getBookingsForShowtime.mockResolvedValue([sampleBooking]);
      const result = await controller.getBookingsForShowtime(sampleShowtime.id);
      expect(result).toEqual([sampleBooking]);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking if exists', async () => {
      mockBookingService.cancelBooking.mockResolvedValue(undefined);
      await expect(controller.cancelBooking(bookedIdExample)).resolves.not.toThrow();
    });

    it('should throw if booking not found', async () => {
      mockBookingService.cancelBooking.mockRejectedValue(new NotFoundException());
      await expect(controller.cancelBooking(bookedIdExample)).rejects.toThrow(NotFoundException);
    });
  });
});
