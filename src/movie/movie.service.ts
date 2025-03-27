import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) { }

  async createMovie(createMovieDto: CreateMovieDto): Promise<Movie> {
    const existing = await this.movieRepository.findOne({
      where: { title: createMovieDto.title },
    });

    if (existing) {
      this.logger.warn(`createMovie: Movie with title '${createMovieDto.title}' already exists`);
      throw new ConflictException(`Movie with title '${createMovieDto.title}' already exists`);
    }

    try {
      const movie = this.movieRepository.create(createMovieDto);
      const saved = await this.movieRepository.save(movie);
      this.logger.log(`createMovie: Movie '${saved.title}' created successfully`);
      return saved;
    } catch (error) {
      this.logger.error(`createMovie: Failed to create movie - ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to create movie. Please try again`);
    }
  }

  async getAllMovies(): Promise<Movie[]> {
    try {
      const movies = await this.movieRepository.find();
      this.logger.log(`getAllMovies: Retrieved ${movies.length} movie(s)`);
      return movies;
    } catch (error) {
      this.logger.error(`getAllMovies: Failed to fetch movies - ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch movies');
    }
  }

  async getMovieById(id: number): Promise<Movie> {
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      this.logger.warn(`getMovieById: Movie with ID ${id} not found`);
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    this.logger.log(`getMovieById: Found movie '${movie.title}'`);
    return movie;
  }

  async updateMovieByTitle(title: string, updateMovieDto: UpdateMovieDto): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { title } });
    if (!movie) {
      this.logger.warn(`updateMovieByTitle: Movie with title '${title}' not found`);
      throw new NotFoundException(`Movie with title '${title}' not found`);
    }

    try {
      await this.movieRepository.update({ title }, updateMovieDto);
      this.logger.log(`updateMovieByTitle: Movie '${title}' updated successfully`);
    } catch (error) {
      this.logger.error(`updateMovieByTitle: Failed to update '${title}' - ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to update movie. Please try again`);
    }
  }

  async deleteMovieByTitle(title: string): Promise<void> {
    const movie = await this.movieRepository.findOne({ where: { title } });
    if (!movie) {
      this.logger.warn(`deleteMovieByTitle: Movie with title '${title}' not found`);
      throw new NotFoundException(`Movie with title '${title}' not found`);
    }

    try {
      await this.movieRepository.delete({ title });
      this.logger.log(`deleteMovieByTitle: Movie '${title}' deleted successfully`);
    } catch (error) {
      this.logger.error(`deleteMovieByTitle: Failed to delete '${title}' - ${error.message}`, error.stack);
      throw new InternalServerErrorException(`Failed to delete movie. Please try again`);
    }
  }
}
