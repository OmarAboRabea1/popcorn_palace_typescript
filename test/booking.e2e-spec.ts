import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './../src/booking/entities/booking.entity';
import { Showtime } from './../src/showtime/entities/showtime.entity';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let bookingRepository: Repository<Booking>;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;
  let showtimeId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    bookingRepository = moduleFixture.get<Repository<Booking>>(getRepositoryToken(Booking));
    showtimeRepository = moduleFixture.get<Repository<Showtime>>(getRepositoryToken(Showtime));
    movieRepository = moduleFixture.get<Repository<Movie>>(getRepositoryToken(Movie));

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await bookingRepository.query('DELETE FROM booking;');
    await showtimeRepository.query('DELETE FROM showtime;');
    await movieRepository.query('DELETE FROM movie;');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const movie = await movieRepository.save({
      title: 'Test Movie',
      genre: 'Action',
      duration: 120,
      rating: 'PG-13',
      release_year: 2023,
    });

    const showtime = await showtimeRepository.save({
      movie,
      theater: 'IMAX 1',
      start_time: new Date().toISOString(),
      end_time: new Date(new Date().getTime() + 7200000).toISOString(),
      price: 15.99,
    });

    showtimeId = showtime.id;
  });

  const bookingDto = {
    customer_name: 'John Doe',
    seat_number: 5,
  };

  it('/bookings (POST) - should create a new booking', async () => {
    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send({ ...bookingDto, showtime: showtimeId })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.seat_number).toBe(5);
  });

  it('/bookings (POST) - should prevent duplicate seat booking', async () => {
    await bookingRepository.save({ ...bookingDto, showtime: { id: showtimeId } });

    await request(app.getHttpServer())
      .post('/bookings')
      .send({ ...bookingDto, showtime: showtimeId })
      .expect(409);
  });

  it('/bookings/:id (GET) - should fetch a booking by ID', async () => {
    const booking = await bookingRepository.save({ ...bookingDto, showtime: { id: showtimeId } });

    const response = await request(app.getHttpServer())
      .get(`/bookings/${booking.id}`)
      .expect(200);

    expect(response.body.id).toBe(booking.id);
  });

  it('/bookings/showtime/:showtimeId (GET) - should return all bookings for a showtime', async () => {
    await bookingRepository.save({ ...bookingDto, showtime: { id: showtimeId } });

    const response = await request(app.getHttpServer())
      .get(`/bookings/showtime/${showtimeId}`)
      .expect(200);

    expect(response.body.length).toBe(1);
  });

  it('/bookings/:id (DELETE) - should cancel a booking', async () => {
    const booking = await bookingRepository.save({ ...bookingDto, showtime: { id: showtimeId } });

    await request(app.getHttpServer())
      .delete(`/bookings/${booking.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/bookings/${booking.id}`)
      .expect(404);
  });
});
