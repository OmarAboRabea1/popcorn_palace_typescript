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

  async createShowtime(createShowtimeDto: CreateShowtimeDto): Promise<Showtime> {
    const movie = await this.movieRepository.findOne({ where: { id: createShowtimeDto.movie } });
  
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${createShowtimeDto.movie} not found`);
    }
  
    // Check for overlapping showtimes in the same theater
    const overlappingShowtime = await this.showtimeRepository.createQueryBuilder('showtime')
      .where('showtime.theater = :theater', { theater: createShowtimeDto.theater })
      .andWhere(':start_time < showtime.end_time AND :end_time > showtime.start_time', {
        start_time: createShowtimeDto.start_time,
        end_time: createShowtimeDto.end_time,
      })
      .getOne();
  
    if (overlappingShowtime) {
      throw new ConflictException('Showtime overlaps with an existing showtime in the same theater');
    }
  
    // Ensure we pass the full Movie object, not just the ID
    const newShowtime = this.showtimeRepository.create({
      movie, // Pass the movie object instead of ID
      theater: createShowtimeDto.theater,
      start_time: createShowtimeDto.start_time,
      end_time: createShowtimeDto.end_time,
      price: createShowtimeDto.price,
    });
  
    return this.showtimeRepository.save(newShowtime);
  }
  

  async getShowtimeById(id: number): Promise<Showtime> {
    const showtime = await this.showtimeRepository.findOne({
      where: { id },
      relations: ['movie'], // ✅ Ensure movie data is included
    });
  
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
    return showtime;
  }


  async getAllShowtimes(): Promise<Showtime[]> {
    return this.showtimeRepository.find({
      relations: ['movie'], // Include movie details in response
    });
  }
  

  async updateShowtime(id: number, updateShowtimeDto: UpdateShowtimeDto): Promise<Showtime> {
    await this.getShowtimeById(id); // Ensure showtime exists
    await this.showtimeRepository.update(id, updateShowtimeDto);
    return this.getShowtimeById(id);
  }

  async deleteShowtime(id: number): Promise<void> {
    await this.getShowtimeById(id); // Ensure showtime exists
    await this.showtimeRepository.delete(id);
  }
}

