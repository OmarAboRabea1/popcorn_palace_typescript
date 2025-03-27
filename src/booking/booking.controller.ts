import { Controller, Post, Get, Delete, Body, Param, ParseIntPipe, HttpCode } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(200)
  createBooking(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @Get(':id')
  getBookingById(@Param('id') id: string) {
    return this.bookingService.getBookingById(id);
  }

  @Get('/showtime/:id')
  getBookingsForShowtime(@Param('id') showtimeId: number) {
    return this.bookingService.getBookingsForShowtime(showtimeId);
  }

  @Delete(':id')
  cancelBooking(@Param('id') id: string) {
    return this.bookingService.cancelBooking(id);
  }
}
