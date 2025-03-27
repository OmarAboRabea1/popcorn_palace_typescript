import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/booking.dto';
import { Showtime } from '../showtime/entities/showtime.entity';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<{ bookingId: string }> {
    try {
      const { showtimeId, seatNumber, userId } = createBookingDto;

      if (!showtimeId || !seatNumber || !userId) {
        this.logger.warn(`createBooking: Missing required fields`);
        throw new BadRequestException('Missing required fields to book a ticket');
      }

      const showtime = await this.showtimeRepository.findOne({ where: { id: showtimeId } });
      if (!showtime) {
        this.logger.warn(`createBooking: Showtime with ID ${showtimeId} not found`);
        throw new NotFoundException(`Showtime with ID ${showtimeId} not found`);
      }

      const existingBooking = await this.bookingRepository.findOne({
        where: {
          showtime: { id: showtime.id },
          seatNumber: seatNumber,
        },
      });

      if (existingBooking) {
        this.logger.warn(
          `createBooking: Seat ${seatNumber} already booked for showtime ID ${showtimeId}`,
        );
        throw new ConflictException(
          `Seat ${seatNumber} is already booked for this showtime`,
        );
      }

      const newBooking = this.bookingRepository.create({
        showtime,
        userId,
        seatNumber,
      });

      const saved = await this.bookingRepository.save(newBooking);
      this.logger.log(`createBooking: Booking created successfully with ID ${saved.id}`);

      return { bookingId: saved.id };
    } catch (error) {
      this.logger.error(`createBooking failed: ${error.message}`, error.stack);
      throw error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException
        ? error
        : new InternalServerErrorException('Unexpected error occurred while booking ticket');
    }
  }


  async getBookingById(id: string): Promise<Booking> {
    try {
      if (!id) {
        this.logger.warn(`getBookingById: Booking ID is required`);
        throw new BadRequestException('Booking ID must be provided');
      }

      const booking = await this.bookingRepository.findOne({ where: { id } });
      if (!booking) {
        this.logger.warn(`getBookingById: Booking with ID ${id} not found`);
        throw new NotFoundException(`Booking with ID ${id} not found`);
      }

      this.logger.log(`getBookingById: Found booking ID ${id}`);
      return booking;
    } catch (error) {
      this.logger.error(`getBookingById failed: ${error.message}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to fetch booking');
    }
  }

  async getBookingsForShowtime(showtimeId: number): Promise<Booking[]> {
    try {
      if (!showtimeId || isNaN(showtimeId)) {
        this.logger.warn(`getBookingsForShowtime: Invalid showtime ID`);
        throw new BadRequestException('Invalid showtime ID');
      }

      const result = await this.bookingRepository.find({
        where: { showtime: { id: showtimeId } },
      });

      this.logger.log(`getBookingsForShowtime: Found ${result.length} bookings`);
      return result;
    } catch (error) {
      this.logger.error(
        `getBookingsForShowtime failed for showtime ID ${showtimeId}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch bookings for showtime');
    }
  }

  async cancelBooking(id: string): Promise<void> {
    try {
      if (!id) {
        this.logger.warn(`cancelBooking: Booking ID is required`);
        throw new BadRequestException('Booking ID must be provided');
      }

      const booking = await this.getBookingById(id);
      await this.bookingRepository.remove(booking);
      this.logger.log(`cancelBooking: Booking ${id} canceled successfully`);
    } catch (error) {
      this.logger.error(`cancelBooking failed: ${error.message}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Failed to cancel booking');
    }
  }
}
