import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { Showtime } from '../../showtime/entities/showtime.entity';

@Entity()
@Unique(['showtime', 'seatNumber'])
export class Booking {
  @PrimaryGeneratedColumn('uuid') // UUID instead of number
  id: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.id, { eager: true, onDelete: 'CASCADE' })
  showtime: Showtime;

  @Column()
  userId: string;

  @Column()
  seatNumber: number;

  // @CreateDateColumn()
  // bookedAt: Date;
}