import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { Showtime } from './../src/showtime/entities/showtime.entity';
import { movieDto, updatedMovieDto } from './e2eTestSamples';

describe('MovieController (e2e)', () => {
  let app: INestApplication;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    showtimeRepository = moduleFixture.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await showtimeRepository.query('DELETE FROM showtime;');
    await movieRepository.query('DELETE FROM movie;');
  });

  afterAll(async () => {
    await app.close();
  });

  it('/movies (POST) - should create a new movie', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieDto)
      .expect(200);

    expect(response.body).toMatchObject({
      id: expect.any(Number),
      title: movieDto.title,
      genre: movieDto.genre,
      duration: movieDto.duration,
      releaseYear: movieDto.releaseYear,
    });
    expect(parseFloat(response.body.rating)).toBeCloseTo(movieDto.rating, 1);
  });

  it('/movies/all (GET) - should return all movies with correct response format', async () => {
    await movieRepository.save(movieDto);

    const response = await request(app.getHttpServer())
      .get('/movies/all')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    const result = response.body[0];
    expect(result).toMatchObject({
      id: expect.any(Number),
      title: movieDto.title,
      genre: movieDto.genre,
      duration: movieDto.duration,
      releaseYear: movieDto.releaseYear,
    });
    expect(parseFloat(result.rating)).toBeCloseTo(movieDto.rating, 1);
  });

  it('/movies/update/:title (POST) - should update and persist changes', async () => {
    // 1. Save the original movie
    const movie = await movieRepository.save(movieDto);
  
    // 2. Update it by title
    await request(app.getHttpServer())
      .post(`/movies/update/${movie.title}`)
      .send(updatedMovieDto)
      .expect(200);
  
    // 3. Query the updated movie from the database
    const updated = await movieRepository.findOne({ where: { title: updatedMovieDto.title } });
  
    // 4. Assert new values
    expect(updated).toBeDefined();
    expect(updated.title).toBe(updatedMovieDto.title);
    expect(updated.genre).toBe(updatedMovieDto.genre);
    expect(updated.duration).toBe(updatedMovieDto.duration);
    expect(updated.releaseYear).toBe(updatedMovieDto.releaseYear);
    expect(parseFloat(updated.rating.toString())).toBeCloseTo(updatedMovieDto.rating, 1);
  
    // 5. Make sure it's not the old one
    expect(updated.title).not.toBe(movieDto.title);
  });
  
  
  it('/movies/:title (DELETE) - should delete a movie and ensure it’s gone', async () => {
    await movieRepository.save(movieDto);

    await request(app.getHttpServer())
      .delete(`/movies/${movieDto.title}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/movies/all')
      .expect(200);

    const found = response.body.find((m: any) => m.title === movieDto.title);
    expect(found).toBeUndefined();
  });
});
