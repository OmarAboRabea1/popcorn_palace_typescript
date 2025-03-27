import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';
import { Movie } from '../movie/entities/movie.entity';

@Injectable()
export class ShowtimeService {
  constructor(
    @InjectRepository(Showtime)
    private readonly showtimeRepository: Repository<Showtime>,

    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async createShowtime(createShowtimeDto: CreateShowtimeDto): Promise<any> {
    const movie = await this.movieRepository.findOne({ where: { id: createShowtimeDto.movieId } });
  
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${createShowtimeDto.movieId} not found`);
    }
  
    // Check for overlapping showtimes in the same theater
    const overlappingShowtime = await this.showtimeRepository.createQueryBuilder('showtime')
      .where('showtime.theater = :theater', { theater: createShowtimeDto.theater })
      .andWhere(':startTime < showtime.endTime AND :endTime > showtime.startTime', {
        startTime: createShowtimeDto.startTime,
        endTime: createShowtimeDto.endTime,
      })
      .getOne();
    
    if (overlappingShowtime) {
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
  
    // Return in expected format
    return {
      id: saved.id,
      price: saved.price,
      movieId: saved.movie.id,
      theater: saved.theater,
      startTime: saved.startTime,
      endTime: saved.endTime,
    };
  }
  

  async getShowtimeById(id: number): Promise<any> {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: ['movie'],
    });
  
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
  
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
    return this.showtimeRepository.find({
      relations: ['movie'], // Include movie details in response
    });
  }
  

  async updateShowtime(id: number, updateDto: UpdateShowtimeDto): Promise<any> {
    const showtime = await this.showtimeRepository.findOne({ where: { id } });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
  
    const movie = await this.movieRepository.findOne({ where: { id: updateDto.movieId } });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${updateDto.movieId} not found`);
    }
  
    const updated = this.showtimeRepository.merge(showtime, {
      ...updateDto,
      movie,
    });
  
    const saved = await this.showtimeRepository.save(updated);
  
    return {
      id: saved.id,
      price: saved.price,
      movieId: saved.movie.id,
      theater: saved.theater,
      startTime: saved.startTime,
      endTime: saved.endTime,
    };
  }
  
  async deleteShowtime(id: number): Promise<void> {
    await this.getShowtimeById(id); // Ensure showtime exists
    await this.showtimeRepository.delete(id);
  }
}

