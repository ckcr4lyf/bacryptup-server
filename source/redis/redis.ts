import Redis from 'ioredis';
import Logger from '../utilities/logger';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT) || 6379;
const redisLogger = new Logger('REDIS');
const redis = new Redis(REDIS_PORT, REDIS_HOST);

redis.on('connect', () => {
    redisLogger.info(`Connected to redis!`);
});

redis.on('error', error => {
    redisLogger.error(`Error from redis: ${error}`);
});

export default redis;