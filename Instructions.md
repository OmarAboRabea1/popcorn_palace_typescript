# 📘 Popcorn Palace — Instructions Guide

Welcome to the official instructions for running, building, and testing the **Popcorn Palace** project. This project is built with **NestJS**, **PostgreSQL**, and **TypeORM**, and is fully containerized using **Docker**.

---

## 🚀 Prerequisites

Make sure you have the following installed:

- [Node.js (v18+)](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install) or `npm`

---

## 🐳 Docker Setup

### 1. Start PostgreSQL Containers

The project uses two PostgreSQL containers:
- `db`: main development database
- `postgres-test`: test database (used for e2e and unit testing)

**Start both containers using Docker Compose:**

```bash
docker-compose up -d
```

> ✅ This will expose:
> - Development DB on `localhost:5432`
> - Test DB on `localhost:5433`

---

## 🛠️ Environment Setup

### 2. Create `.env` and `.env.test`

#### `.env`
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=popcorn-palace
DB_PASS=popcorn-palace
DB_NAME=popcorn-palace
```

#### `.env.test`
```env
DB_HOST=localhost
DB_PORT=5433
DB_USER=testuser
DB_PASS=testpass
DB_NAME=popcorn_palace_test
```

---

## 📦 Install Dependencies

From the root directory, run:

```bash
npm install
# or
yarn install
```

---

## 🧪 Testing


### ✅ Run Unit Test + Coverage

```bash
npm run test
npm run test:cov
# or
yarn test
yarn test:cov
```

---

### ✅ Run E2E Tests

```bash
npm run test:e2e
# or
yarn test:e2e
```

---

## 🚧 Build the Project

To compile the project using the NestJS compiler:

```bash
npm run build
# or
yarn build
```

The output will be in the `dist/` folder.

---

## 👟 Run the App Locally (Dev Mode)

```bash
npm run start:dev
# or
yarn start:dev
```

---

## 🧹 Cleanup Docker

To stop and remove the containers:

```bash
docker-compose down
```

---

## ✅ Summary

| Command                | Description                            |
|------------------------|----------------------------------------|
| `docker-compose up -d` | Start PostgreSQL containers            |
| `npm install`          | Install project dependencies           |
| `npm run start:dev`    | Run project in development mode        |
| `npm run test`         | Run unit tests                         |
| `npm run test:cov`     | Run all tests with coverage report     |
| `npm run test:e2e`     | Run all e2e tests     |
| `npm run build`        | Build the NestJS project               |
| `docker-compose down`  | Stop all containers                    |




# 🎬 Popcorn Palace – API Documentation

This section outlines the available API endpoints for managing **Movies**, **Showtimes**, and **Bookings**.

---

## 🎞️ Movies APIs

| API Description       | Method | Endpoint                    | Request Body                                                                                   | Response Status | Response Example                                                                                                                                                     |
|-----------------------|--------|-----------------------------|--------------------------------------------------------------------------------------------------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Get all movies        | GET    | `/movies/all`              | —                                                                                                | 200 OK           | `[{"id":1,"title":"Inception","genre":"Sci-Fi","duration":148,"rating":8.7,"releaseYear":2010}]`                                                                   |
| Add a movie           | POST   | `/movies`                  | `{ "title": "Inception", "genre": "Sci-Fi", "duration": 148, "rating": 8.7, "releaseYear": 2010 }` | 200 OK           | `{ "id": 1, "title": "Inception", "genre": "Sci-Fi", "duration": 148, "rating": 8.7, "releaseYear": 2010 }`                                                        |
| Update a movie        | POST   | `/movies/update/{title}`   | `{ "title": "Interstellar", "genre": "Sci-Fi", "duration": 160, "rating": 9.1, "releaseYear": 2014 }` | 200 OK           | —                                                                                                                                                                    |
| Delete a movie        | DELETE | `/movies/{title}`          | —                                                                                                | 200 OK           | —                                                                                                                                                                    |

---

## ⏰ Showtimes APIs

| API Description       | Method | Endpoint                         | Request Body                                                                                          | Response Status | Response Example                                                                                                                                                   |
|-----------------------|--------|----------------------------------|---------------------------------------------------------------------------------------------------------|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Get showtime by ID    | GET    | `/showtimes/{id}`                | —                                                                                                       | 200 OK           | `{ "id": 1, "price": 50.2, "movieId": 1, "theater": "Cinema X", "startTime": "2025-02-14T11:47:46.125Z", "endTime": "2025-02-14T14:47:46.125Z" }`                  |
| Add a showtime        | POST   | `/showtimes`                     | `{ "movieId": 1, "price": 50.2, "theater": "Cinema X", "startTime": "...", "endTime": "..." }`         | 200 OK           | `{ "id": 1, "price": 50.2, "movieId": 1, "theater": "Cinema X", "startTime": "...", "endTime": "..." }`                                                            |
| Update a showtime     | POST   | `/showtimes/update/{id}`         | `{ "movieId": 1, "price": 45.0, "theater": "Cinema Y", "startTime": "...", "endTime": "..." }`         | 200 OK           | —                                                                                                                                                                  |
| Delete a showtime     | DELETE | `/showtimes/{id}`                | —                                                                                                       | 200 OK           | —                                                                                                                                                                  |

---

## 🎟️ Bookings APIs

| API Description       | Method | Endpoint               | Request Body                                                                                      | Response Status | Response Example                                                                                           |
|-----------------------|--------|------------------------|-----------------------------------------------------------------------------------------------------|------------------|------------------------------------------------------------------------------------------------------------|
| Book a ticket         | POST   | `/bookings`            | `{ "showtimeId": 1, "seatNumber": 15, "userId": "84438967-f68f-4fa0-b620-0f08217e76af" }`          | 200 OK           | `{ "bookingId": "d1a6423b-4469-4b00-8c5f-e3cfc42eacae" }`                                                  |
| Get booking by ID     | GET    | `/bookings/{id}`       | —                                                                                                  | 200 OK           | `{ "id": "...", "showtimeId": 1, "seatNumber": 15, "userId": "...", "bookedAt": "..." }`                  |
| Get bookings by showtime | GET | `/bookings/showtime/{id}` | —                                                                                                  | 200 OK           | `[ { "id": "...", "showtimeId": 1, "seatNumber": 15, "userId": "...", "bookedAt": "..." } ]`              |
| Cancel a booking      | DELETE | `/bookings/{id}`       | —                                                                                                  | 200 OK           | —                                                                                                          |
