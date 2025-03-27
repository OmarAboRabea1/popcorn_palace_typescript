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

  async createBooking(createBookingDto: CreateBookingDto): Promise<{ bookingId: string }> {
    const showtime = await this.showtimeRepository.findOne({ where: { id: createBookingDto.showtimeId } });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${createBookingDto.showtimeId} not found`);
    }
  
    // Prevent seat conflict
    const existingBooking = await this.bookingRepository.findOne({
      where: {
        showtime: { id: showtime.id },
        seatNumber: createBookingDto.seatNumber,
      },
    });
  
    if (existingBooking) {
      throw new ConflictException(`Seat ${createBookingDto.seatNumber} is already booked for this showtime`);
    }
  
    const newBooking = this.bookingRepository.create({
      showtime,
      userId: createBookingDto.userId,
      seatNumber: createBookingDto.seatNumber,
    });
  
    const saved = await this.bookingRepository.save(newBooking);
  
    return { bookingId: saved.id };
  }
  

  async getBookingById(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async getBookingsForShowtime(showtimeId: number): Promise<Booking[]> {
    return this.bookingRepository.find({ where: { showtime: { id: showtimeId } } });
  }

  async cancelBooking(id: string): Promise<void> {
    const booking = await this.getBookingById(id);
    await this.bookingRepository.remove(booking);
  }
}
