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

  async updateMovieByTitle(title: string, updateMovieDto: UpdateMovieDto): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { title } });
    if (!movie) {
      throw new NotFoundException(`Movie with title '${title}' not found`);
    }
  
    await this.movieRepository.update({ title }, updateMovieDto);
  }  

  async deleteMovieByTitle(title: string): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { title } });
    if (!movie) {
      throw new NotFoundException(`Movie with title '${title}' not found`);
    }

    await this.movieRepository.delete({ title });
  } 
}
