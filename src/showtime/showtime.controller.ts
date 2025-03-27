import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, HttpCode } from '@nestjs/common';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';

@Controller('showtimes')
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @Post()
  @HttpCode(200)
  createShowtime(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.showtimeService.createShowtime(createShowtimeDto);
  }

  @Get('all')
  getAllShowtimes() {
    return this.showtimeService.getAllShowtimes();
}

  @Get(':id')
  getShowtimeById(@Param('id', ParseIntPipe) id: number) {
    return this.showtimeService.getShowtimeById(id);
  }

  @Post('update/:id')
  @HttpCode(200)
  updateShowtime(@Param('id', ParseIntPipe) id: number, @Body() updateShowtimeDto: UpdateShowtimeDto) {
    return this.showtimeService.updateShowtime(id, updateShowtimeDto);
  }

  @Delete(':id')
  deleteShowtime(@Param('id', ParseIntPipe) id: number) {
    return this.showtimeService.deleteShowtime(id);
  }
}
