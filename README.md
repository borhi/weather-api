# Weather API Service

A weather API service that allows users to subscribe to weather updates for their city.

## Features

- Weather information retrieval
- Email subscription management
- Hourly/daily weather updates
- Email confirmation system
- Easy unsubscribe functionality
- RESTful API with Swagger documentation

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 12 or higher
- Docker and Docker Compose
- WeatherAPI.com API key
- SMTP server for sending emails

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd weather-api
```

2. Create a `.env` file based on `.env.dist`:
```bash
cp .env.dist .env
```

3. Update the `.env` file with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weather_api
DB_USER=postgres
DB_PASSWORD=postgres

# Weather API
WEATHER_API_KEY=your_api_key_here
WEATHER_API_URL=https://api.weatherapi.com/v1/
WEATHER_API_TIMEOUT=5000

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_password
SMTP_FROM=Weather Updates <noreply@example.com>

# Logging
LOG_LEVEL=info
```

4. Start the application using Docker Compose:
```bash
docker compose up --build
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Weather

- `GET /api/weather?city=<city>` - Get current weather for a city

### Subscriptions

- `POST /api/subscribe` - Subscribe to weather updates
- `GET /api/confirm/{token}` - Confirm email subscription
- `GET /api/unsubscribe/{token}` - Unsubscribe from weather updates

## Development

### Project Structure

```
src/
  ├── config/         # Configuration files
  ├── database/       # Database migrations and seeders
  ├── models/         # Sequelize models
  ├── routes/         # API routes
  ├── utils/          # Utility functions
  └── index.js        # Application entry point
```

### Database Management

#### Migrations

Run migrations to create or update database tables:
```bash
docker compose exec app npm run migrate
```

Undo the last migration:
```bash
docker compose exec app npm run migrate:undo
```

Undo all migrations:
```bash
docker compose exec app npm run migrate:undo:all
```

#### Seeders

Run seeders to populate the database with demo data:
```bash
docker compose exec app npm run seed
```

Undo the last seeder:
```bash
docker compose exec app npm run seed:undo
```

Undo all seeders:
```bash
docker compose exec app npm run seed:undo:all
```

### Running Tests

```bash
docker compose exec app npm test
```

## License

MIT 