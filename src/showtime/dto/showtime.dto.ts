import { IsNotEmpty, IsString, IsDate, IsNumber, Min } from 'class-validator';

export class CreateShowtimeDto {
  @IsNotEmpty()
  movieId: number;

  @IsNotEmpty()
  @IsString()
  theater: string;

  @IsNotEmpty()
  @IsDate()
  startTime: Date;

  @IsNotEmpty()
  @IsDate()
  endTime: Date;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateShowtimeDto {
  @IsNotEmpty()
  movieId: number;
  
  @IsString()
  theater?: string;

  @IsDate()
  startTime?: Date;

  @IsDate()
  endTime?: Date;

  @IsNumber()
  @Min(0)
  price?: number;
}
