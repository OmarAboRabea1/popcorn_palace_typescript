import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get(':id')
  getBookingById(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.getBookingById(id);
  }

  @Get('/showtime/:showtimeId')
  getBookingsForShowtime(@Param('showtimeId', ParseIntPipe) showtimeId: number) {
    return this.bookingService.getBookingsForShowtime(showtimeId);
  }

  @Delete(':id')
  cancelBooking(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.cancelBooking(id);
  }
}
