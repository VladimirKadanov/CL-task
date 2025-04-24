import Redis from 'ioredis';

let redisClient: Redis | null = null;

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log('REDIS_URL not found, caching disabled.');
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      // Optional: Add retry strategy, tls options etc. here
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // Add more specific error handling if needed
      connectTimeout: 10000, // 10 seconds
    });

    client.on('connect', () => console.log('Connected to Redis'));
    client.on('ready', () => console.log('Redis client ready'));
    client.on('error', (err) => console.error('Redis connection error:', err));
    client.on('reconnecting', () => console.log('Reconnecting to Redis...'));
    client.on('end', () => console.log('Redis connection closed'));

    return client;
  } catch (error) {
    console.error('Failed to initialize Redis client:', error);
    return null;
  }
}

export function getRedisClient(): Redis | null {
  if (!redisClient) {
    redisClient = createRedisClient();
  }
  return redisClient;
} 