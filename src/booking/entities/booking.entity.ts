import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { Showtime } from '../../showtime/entities/showtime.entity';

@Entity()
@Unique(['showtime', 'seat_number']) // ✅ Prevent duplicate bookings for the same seat
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Showtime, (showtime) => showtime.id, { eager: true })
  showtime: Showtime;

  @Column()
  customer_name: string;

  @Column()
  seat_number: number; // ✅ Ensure unique seat assignment

  @CreateDateColumn()
  booked_at: Date;
}
