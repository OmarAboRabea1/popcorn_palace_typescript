import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { Showtime } from './../src/showtime/entities/showtime.entity';

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
    await showtimeRepository.query('DELETE FROM showtime;'); // ✅ First delete showtimes
    await movieRepository.query('DELETE FROM movie;'); // ✅ Then delete movies
  });
  

  afterAll(async () => {
    await app.close();
  });

  const movieDto = {
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 'PG-13',
    release_year: 2010,
  };

  it('/movies (POST) - should create a new movie', async () => {
    const response = await request(app.getHttpServer())
      .post('/movies')
      .send(movieDto)
      .expect(201);

    expect(response.body).toMatchObject(movieDto);
    expect(response.body).toHaveProperty('id');
  });

  it('/movies (GET) - should return an array of movies', async () => {
    await movieRepository.save(movieDto); // Insert test data

    const response = await request(app.getHttpServer())
      .get('/movies')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Inception');
  });

  it('/movies/:id (GET) - should return a single movie', async () => {
    const movie = await movieRepository.save(movieDto);
  
    const response = await request(app.getHttpServer())
      .get(`/movies/${movie.id}`)
      .expect(200);
  
    expect(response.body).toMatchObject({
      ...movieDto,
      created_at: expect.any(String), // Accept any valid string timestamp
      updated_at: expect.any(String),
    });
  });
  

  it('/movies/:id (PATCH) - should update a movie', async () => {
    const movie = await movieRepository.save(movieDto);
    const updatedData = { title: 'Interstellar' };

    const response = await request(app.getHttpServer())
      .patch(`/movies/${movie.id}`)
      .send(updatedData)
      .expect(200);

    expect(response.body.title).toBe('Interstellar');
  });

  it('/movies/:id (DELETE) - should delete a movie', async () => {
    const movie = await movieRepository.save(movieDto);

    await request(app.getHttpServer())
      .delete(`/movies/${movie.id}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get(`/movies/${movie.id}`)
      .expect(404);
  });
});
