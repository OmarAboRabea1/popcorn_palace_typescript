export const movieDto = {
    title: 'Inception',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 8.7,
    releaseYear: 2010,
};

export const updatedMovieDto = {
    title: 'Interstellar',
    genre: 'Sci-Fi',
    duration: 160,
    rating: 9.1,
    releaseYear: 2014,
};


export const testMovie = {
    title: 'Test Movie',
    genre: 'Action',
    duration: 120,
    rating: 8.8,
    releaseYear: 2023,
};


export const showtimeDto = {
    movie: 1,
    theater: 'IMAX 1',
    startTime: new Date().toISOString(),
    endTime: new Date(new Date().getTime() + 7200000).toISOString(),
    price: 15.99,
};
