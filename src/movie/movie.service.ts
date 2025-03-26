import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const movie = this.movieRepository.create(createMovieDto);
    return this.movieRepository.save(movie);
  }

  async getAllMovies(): Promise<Movie[]> {
    return this.movieRepository.find();
  }

  async getMovieById(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return movie;
  }

  async updateMovie(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    await this.getMovieById(id); // Ensure movie exists
    await this.movieRepository.update(id, updateMovieDto);
    return this.getMovieById(id);
  }

  async deleteMovie(id: number): Promise<void> {
    await this.getMovieById(id); // Ensure movie exists
    await this.movieRepository.delete(id);
  }
}
