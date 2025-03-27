import { IsInt, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

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

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;  

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  releaseYear: number;
}

export class UpdateMovieDto {
  @IsString()
  title?: string;

  @IsString()
  genre?: string;

  @IsInt()
  @Min(1)
  duration?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;  

  @IsInt()
  @Max(new Date().getFullYear())
  releaseYear?: number;
}
