# RewriteForge

A service that transforms plain text into different styles using LLM technology.

## Features

- Transform text into different styles (pirate, haiku, formal)
- Configurable LLM backend (OpenAI, Mock)
- Health check endpoint
- Containerized deployment

## API Endpoints

### POST /v1/rewrite
Transform text into a specified style.

Request body:
```json
{
  "text": "Your text here",
  "style": "pirate" | "haiku" | "formal"
}
```

Response:
```json
{
  "original": "Your text here",
  "transformed": "Transformed text here"
}
```

### GET /health
Health check endpoint.

Response:
```json
{
  "status": "ok"
}
```

## Environment Variables

### Required Variables
- `PORT`: Server port (default: 3000)
- `LLM_API_KEY`: API key for LLM service (optional, if not provided, mock adapter will be used)

### Optional Variables
- `LLM_MODEL`: LLM model to use (default: gpt-3.5-turbo)
- `LLM_MAX_TOKENS`: Maximum tokens for LLM response (default: 1000)
- `LLM_TEMPERATURE`: Temperature for LLM response (default: 0.7)
- `LLM_BASE_URL`: Custom base URL for the LLM API (e.g., for proxies or compatible local models).
- `LOG_LEVEL`: Logging level (default: info)
- `NODE_ENV`: Environment mode (development/production)

### Redis Configuration (Optional)
- `REDIS_URL`: Connection URL for Redis (e.g., `redis://localhost:6379`).
- `CACHE_TTL_SECONDS`: Cache expiration time in seconds (default: `3600`).

### Example Configuration
Create a `.env` file in the root directory:
```bash
# Server Configuration
PORT=3000

# LLM Configuration
LLM_API_KEY=your_api_key_here

# Optional: LLM Configuration
LLM_MODEL=gpt-3.5-turbo
LLM_MAX_TOKENS=1000
LLM_TEMPERATURE=0.7
# LLM_BASE_URL=http://localhost:11434/v1 # Example for local Ollama

# Optional: Logging Configuration
LOG_LEVEL=info
NODE_ENV=development
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Copy the example environment file:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration

4. Start development server:
```bash
npm run dev
```

5. Run tests:
```bash
npm test
```

   You can also run tests in watch mode:
```bash
npm run test:watch
```

   Or generate a coverage report:
```bash
npm run test:coverage
```

6. Run linter:
```bash
npm run lint
```

   To automatically fix linting issues:
```bash
npm run lint -- --fix
```

## Docker

### Using Docker Compose (Recommended)

Docker Compose will automatically start a Redis container alongside the application if you uncomment the `REDIS_URL` in your `.env` file (or provide it otherwise). Set `REDIS_URL=redis://redis:6379` in your `.env` file to connect to the Compose-managed Redis service.

1. Build and start the container:
```bash
# Ensure REDIS_URL is set in .env if you want caching
docker-compose up -d --build
```

2. Stop the container:
```bash
docker-compose down
```

3. View logs:
```bash
docker-compose logs -f
```

### Manual Docker Commands

Alternatively, you can use manual Docker commands:

```bash
# Build the image
docker build -t rewrite-forge .

# Run the container
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e LLM_API_KEY=your_api_key_here \
  rewrite-forge
```

## License

MIT