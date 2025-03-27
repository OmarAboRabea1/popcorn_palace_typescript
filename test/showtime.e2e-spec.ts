import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Showtime } from './../src/showtime/entities/showtime.entity';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { showtimeDto, testMovie } from './e2eTestSamples';

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

  beforeEach(async () => {
    const movie = await movieRepository.save(testMovie);
    movieId = movie.id;
  });

  it('/showtimes (POST) - should create a new showtime', async () => {
    const response = await request(app.getHttpServer())
      .post('/showtimes')
      .send({ ...showtimeDto, movie: movieId })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body.movieId).toBe(movieId);
  });

  it('/showtimes/all (GET) - should return all showtimes', async () => {
    await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    const response = await request(app.getHttpServer())
      .get('/showtimes/all')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body[0].theater).toBe(showtimeDto.theater);
  });

  it('/showtimes/:id (GET) - should fetch a showtime by ID', async () => {
    const showtime = await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    const response = await request(app.getHttpServer())
      .get(`/showtimes/${showtime.id}`)
      .expect(200);

    expect(response.body.id).toBe(showtime.id);
  });

  it('/showtimes/update/:id (POST) - should update a showtime', async () => {
    const showtime = await showtimeRepository.save({ ...showtimeDto, movie: { id: movieId } });

    const updatedData = { price: 19.99 };

    const response = await request(app.getHttpServer())
      .post(`/showtimes/update/${showtime.id}`)
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
