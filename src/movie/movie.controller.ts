import { Controller, Post, Get, Patch, Delete, Body, Param, ParseIntPipe, HttpCode } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';

@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Post()
  @HttpCode(200)
  createMovie(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.createMovie(createMovieDto);
  }

  @Get('all')
  getAllMovies() {
    return this.movieService.getAllMovies();
  }

  @Get(':id')
  getMovieById(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.getMovieById(id);
  }

  @Post('update/:title')
  @HttpCode(200)
  updateMovieByTitle(
    @Param('title') title: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    return this.movieService.updateMovieByTitle(title, updateMovieDto);
  }

  @Delete(':title')
  deleteMovieByTitle(@Param('title') title: string) {
    return this.movieService.deleteMovieByTitle(title);
  }
}
