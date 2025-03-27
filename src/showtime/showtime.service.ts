import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';
import { Movie } from '../movie/entities/movie.entity';

@Injectable()
export class ShowtimeService {
  private readonly logger = new Logger(ShowtimeService.name);

  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,

    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createShowtime(createShowtimeDto: CreateShowtimeDto): Promise<any> {
    try {
      const movie = await this.movieRepository.findOne({ where: { id: createShowtimeDto.movieId } });

      if (!movie) {
        this.logger.warn(`createShowtime: Movie with ID ${createShowtimeDto.movieId} not found`);
        throw new NotFoundException(`Movie with ID ${createShowtimeDto.movieId} not found`);
      }

      const overlappingShowtime = await this.showtimeRepository.createQueryBuilder('showtime')
        .where('showtime.theater = :theater', { theater: createShowtimeDto.theater })
        .andWhere(':startTime < showtime.endTime AND :endTime > showtime.startTime', {
          startTime: createShowtimeDto.startTime,
          endTime: createShowtimeDto.endTime,
        })
        .getOne();

      if (overlappingShowtime) {
        this.logger.warn(`createShowtime: Overlapping showtime detected in theater ${createShowtimeDto.theater}`);
        throw new ConflictException('Showtime overlaps with an existing showtime in the same theater');
      }

      const newShowtime = this.showtimeRepository.create({
        movie,
        theater: createShowtimeDto.theater,
        startTime: createShowtimeDto.startTime,
        endTime: createShowtimeDto.endTime,
        price: createShowtimeDto.price,
      });

      const saved = await this.showtimeRepository.save(newShowtime);
      this.logger.log(`createShowtime: Showtime ${saved.id} created successfully`);
  
    // Return in expected format
      return {
        id: saved.id,
        price: saved.price,
        movieId: saved.movie.id,
        theater: saved.theater,
        startTime: saved.startTime,
        endTime: saved.endTime,
      };
    } catch (error) {
      this.logger.error(`createShowtime: Failed - ${error.message}`, error.stack);
      throw error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Unexpected error occurred while creating showtime');
    }
  }

  async getShowtimeById(id: number): Promise<any> {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: ['movie'],
    });

    if (!showtime) {
      this.logger.warn(`getShowtimeById: Showtime with ID ${id} not found`);
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    this.logger.log(`getShowtimeById: Found showtime ID ${id}`);
    return {
      id: showtime.id,
      price: showtime.price,
      movieId: showtime.movie.id,
      theater: showtime.theater,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
    };
  }
  async getAllShowtimes(): Promise<Showtime[]> {
    try {
      const result = await this.showtimeRepository.find({ relations: ['movie'] });
      this.logger.log(`getAllShowtimes: Returned ${result.length} showtime(s)`);
      return result;
    } catch (error) {
      this.logger.error(`getAllShowtimes: Failed - ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to retrieve showtimes');
    }
  }

  async updateShowtime(id: number, updateDto: UpdateShowtimeDto): Promise<any> {
    try {
      const showtime = await this.showtimeRepository.findOne({ where: { id } });
      if (!showtime) {
        this.logger.warn(`updateShowtime: Showtime with ID ${id} not found`);
        throw new NotFoundException(`Showtime with ID ${id} not found`);
      }
      const movie = await this.movieRepository.findOne({ where: { id: updateDto.movieId } });
      if (!movie) {
        this.logger.warn(`updateShowtime: Movie with ID ${updateDto.movieId} not found`);
        throw new NotFoundException(`Movie with ID ${updateDto.movieId} not found`);
      }

      const updated = this.showtimeRepository.merge(showtime, {
        ...updateDto,
        movie,
      });

      const saved = await this.showtimeRepository.save(updated);
      this.logger.log(`updateShowtime: Showtime ${id} updated successfully`);

      return {
        id: saved.id,
        price: saved.price,
        movieId: saved.movie.id,
        theater: saved.theater,
        startTime: saved.startTime,
        endTime: saved.endTime,
      };
    } catch (error) {
      this.logger.error(`updateShowtime: Failed to update showtime ID ${id} - ${error.message}`, error.stack);
      throw error instanceof NotFoundException || error instanceof BadRequestException
        ? error
        : new InternalServerErrorException('Unexpected error occurred while updating showtime');
    }
  }

  async deleteShowtime(id: number): Promise<void> {
    try {
      await this.getShowtimeById(id); // Validates existence
      await this.showtimeRepository.delete(id);
      this.logger.log(`deleteShowtime: Showtime ${id} deleted successfully`);
    } catch (error) {
      this.logger.error(`deleteShowtime: Failed to delete showtime ID ${id} - ${error.message}`, error.stack);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to delete showtime');
    }
  }
}
