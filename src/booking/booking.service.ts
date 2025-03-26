import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/booking.dto';
import { Showtime } from '../showtime/entities/showtime.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,

    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    const showtime = await this.showtimeRepository.findOne({ where: { id: createBookingDto.showtime } });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${createBookingDto.showtime} not found`);
    }

    // Ensure no duplicate seat bookings for the same showtime
    const existingBooking = await this.bookingRepository.findOne({
      where: { showtime: { id: showtime.id }, seat_number: createBookingDto.seat_number },
    });

    if (existingBooking) {
      throw new ConflictException(`Seat ${createBookingDto.seat_number} is already booked for this showtime`);
    }

    const newBooking = this.bookingRepository.create({
      showtime,
      customer_name: createBookingDto.customer_name,
      seat_number: createBookingDto.seat_number,
    });

    return this.bookingRepository.save(newBooking);
  }

  async getBookingById(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async getBookingsForShowtime(showtimeId: number): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { showtime: { id: showtimeId } } });
  }

  async cancelBooking(id: number): Promise<void> {
    const booking = await this.getBookingById(id);
    await this.bookingRepository.remove(booking);
  }
}
