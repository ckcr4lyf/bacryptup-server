import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;

const redis = new Redis(REDIS_PORT, REDIS_HOST);

redis.on('connect', () => {
    console.log(`Connected to redis!`);
});

redis.on('error', error => {
    console.log(`Error from redis:`, error);
});

export default redis;