import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  genre: string;

  @IsInt()
  @Min(1)
  duration: number;

  @IsNotEmpty()
  @IsString()
  rating: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  release_year: number;
}

export class UpdateMovieDto {
  @IsString()
  title?: string;

  @IsString()
  genre?: string;

  @IsInt()
  @Min(1)
  duration?: number;

  @IsString()
  rating?: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  release_year?: number;
}
