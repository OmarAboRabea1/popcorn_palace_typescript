import { IsNotEmpty, IsInt, Min, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsInt()
  showtimeId: number;

  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsInt()
  @Min(1)
  seatNumber: number;
}