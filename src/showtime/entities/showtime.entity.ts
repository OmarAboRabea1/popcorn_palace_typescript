import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Movie } from '../../movie/entities/movie.entity';

@Entity()
@Unique(['theater'])
export class Showtime {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Movie, (movie) => movie.id, { eager: true }) 
  movie: Movie;

  @Column()
  theater: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column('float')
  price: number;

  // @CreateDateColumn()
  // created_at: Date;

  // @UpdateDateColumn()
  // updated_at: Date;
}
