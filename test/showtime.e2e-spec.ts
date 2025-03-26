import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from './../src/showtime/entities/showtime.entity';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';

describe('ShowtimeController (e2e)', () => {
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

  let movieId: number;
  const testMovie = {
    title: 'Test Movie',
    genre: 'Action',
    duration: 120,
    rating: 'PG-13',
    release_year: 2023,
  };

  beforeEach(async () => {
    const movie = await movieRepository.save(testMovie);
    movieId = movie.id;
  });

  const showtimeDto = {
    movie: 1, // This will be dynamically replaced in tests
    theater: 'IMAX 1',
    start_time: new Date().toISOString(), // ✅ Ensure date format is correct
    end_time: new Date(new Date().getTime() + 7200000).toISOString(), // ✅ Ensure date format is correct
    price: 15.99,
  };

  it('/showtimes (POST) - should create a new showtime', async () => {
    const response = await request(app.getHttpServer())
      .post('/showtimes')
      .send({ ...showtimeDto, movie: movieId }) // Pass valid movie object
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toMatchObject({ ...showtimeDto, movie: { id: movieId } });
  });

  it('/showtimes/:id (GET) - should fetch a showtime by ID', async () => {
    const showtime = await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    const response = await request(app.getHttpServer())
      .get(`/showtimes/${showtime.id}`)
      .expect(200);

    expect(response.body.id).toBe(showtime.id);
  });

  it('/showtimes/:id (PATCH) - should update a showtime', async () => {
    const showtime = await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    const updatedData = { price: 19.99 };

    const response = await request(app.getHttpServer())
      .patch(`/showtimes/${showtime.id}`)
      .send(updatedData)
      .expect(200);

    expect(Number(response.body.price)).toBe(19.99);
  });

  it('/showtimes/:id (DELETE) - should delete a showtime', async () => {
    const showtime = await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    await request(app.getHttpServer())
      .delete(`/showtimes/${showtime.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/showtimes/${showtime.id}`)
      .expect(404);
  });
});
