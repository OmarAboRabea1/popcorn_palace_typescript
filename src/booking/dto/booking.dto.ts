import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  showtime: number; // Showtime ID

  @IsNotEmpty()
  @IsString()
  customer_name: string;

  @IsInt()
  @Min(1)
  seat_number: number;
}
