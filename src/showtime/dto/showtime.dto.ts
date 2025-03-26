import { IsNotEmpty, IsString, IsDate, IsNumber, Min } from 'class-validator';

export class CreateShowtimeDto {
  @IsNotEmpty()
  movie: number;

  @IsNotEmpty()
  @IsString()
  theater: string;

  @IsNotEmpty()
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @IsDate()
  end_time: Date;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateShowtimeDto {
  @IsString()
  theater?: string;

  @IsDate()
  start_time?: Date;

  @IsDate()
  end_time?: Date;

  @IsNumber()
  @Min(0)
  price?: number;
}
