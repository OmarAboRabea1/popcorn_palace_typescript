import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Logger } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './../src/booking/entities/booking.entity';
import { Showtime } from './../src/showtime/entities/showtime.entity';
import { Movie } from './../src/movie/entities/movie.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { movieDto } from './e2eTestSamples';

describe('BookingController (e2e)', () => {
  let app: INestApplication;
  let bookingRepository: Repository<Booking>;
  let showtimeRepository: Repository<Showtime>;
  let movieRepository: Repository<Movie>;
  let showtimeId: number;
  const userId = uuidv4();

  beforeAll(async () => {
    // Suppress specific expected errors in logs
    jest.spyOn(Logger.prototype, 'error').mockImplementation((message, stack, context) => {
      if (
        typeof message === 'string' &&
        (
          message.includes('already booked') ||
          message.includes('not found')
        )
      ) {
        return; // Don't log expected error messages
      }
    });

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
    const movie = await movieRepository.save(movieDto);

    const showtime = await showtimeRepository.save({
      movie,
      theater: 'IMAX 1',
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 7200000).toISOString(),
      price: 15.99,
    });

    showtimeId = showtime.id;
  });

  const bookingDto = {
    userId,
    seatNumber: 5,
  };

  it('/bookings (POST) - should create a new booking', async () => {
    const response = await request(app.getHttpServer())
      .post('/bookings')
      .send({ ...bookingDto, showtimeId })
      .expect(200);

    expect(response.body).toHaveProperty('bookingId');
    expect(typeof response.body.bookingId).toBe('string');
  });

  it('/bookings (POST) - should prevent duplicate seat booking', async () => {
    await request(app.getHttpServer())
      .post('/bookings')
      .send({ ...bookingDto, showtimeId })
      .expect(200);

    await request(app.getHttpServer())
      .post('/bookings')
      .send({ ...bookingDto, showtimeId })
      .expect(409);
  });

  it('/bookings/:id (GET) - should fetch a booking by ID', async () => {
    const booking = await bookingRepository.save({
      userId,
      seatNumber: bookingDto.seatNumber,
      showtime: { id: showtimeId },
    });

    const response = await request(app.getHttpServer())
      .get(`/bookings/${booking.id}`)
      .expect(200);

    expect(response.body.id).toBe(booking.id);
  });

  it('/bookings/showtime/:showtimeId (GET) - should return all bookings for a showtime', async () => {
    await bookingRepository.save({
      userId,
      seatNumber: bookingDto.seatNumber,
      showtime: { id: showtimeId },
    });

    const response = await request(app.getHttpServer())
      .get(`/bookings/showtime/${showtimeId}`)
      .expect(200);

    expect(response.body.length).toBe(1);
  });

  it('/bookings/:id (DELETE) - should cancel a booking', async () => {
    const booking = await bookingRepository.save({
      userId,
      seatNumber: bookingDto.seatNumber,
      showtime: { id: showtimeId },
    });

    await request(app.getHttpServer())
      .delete(`/bookings/${booking.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/bookings/${booking.id}`)
      .expect(404);
  });
});
