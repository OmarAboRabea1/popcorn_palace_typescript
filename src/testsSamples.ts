import { Showtime } from "./showtime/entities/showtime.entity";

export const sampleMovie = {
    id: 1,
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.8,
    releaseYear: 2010,
};


export const sampleShowtime = {
    id: 1,
    theater: 'Cinema 1',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    price: 50.5,
    movie: sampleMovie,
} as Showtime;


export const sampleShowtimeResult = {
    id: 1,
    theater: 'Cinema 1',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    price: 50.5,
    movieId: sampleMovie.id,
};


export const sampleBooking = {
    id: '1d861f6c-db69-4554-92be-1ae4773e594a',
    seatNumber: 5,
    userId: '84438967-f68f-4fa0-b620-0f08217e76af',
    showtime: sampleShowtime,
};

export const sampleBookingResult = {
    bookingId: "1d861f6c-db69-4554-92be-1ae4773e594a"
};


export const userIdExample = '84438967-f68f-4fa0-b620-0f08217e76af'


export const bookedIdExample = '1d861f6c-db69-4554-92be-1ae4773e594a'