import './config';
import express from 'express';
import http from 'http';
import router from './api/router';
import { performance } from 'perf_hooks';
import Logger from './utilities/logger';

declare global {
    namespace Express {
        interface Request {
            __startAt: number,
            __filename: string,
            __iv: string,
            __fileSize: number,
            __expiry: number
        }
    }
}

const app = express();
const httpLogger = new Logger("HTTP");
const appLogger = new Logger("APP");

app.use(express.json());
app.use(express.raw());
app.disable('x-powered-by');
app.disable('etag');

app.use((req, res, next) => {
    req.__startAt = performance.now();
    res.on('finish', () => {
        const timeTaken = performance.now() - req.__startAt;
        httpLogger.info(`${req.method} ${req.baseUrl}${req.path} - ${res.statusCode} (${timeTaken.toFixed(2)}ms)`);
    });
    next();
})

app.use('/v1', router);

const IP = process.env.IP || '127.0.0.1';
const PORT = parseInt(process.env.PORT) || 3000;

http.createServer(app).listen(PORT, IP, () => {
    appLogger.info(`Server started at ${IP}:${PORT}`);
});

process.on('SIGINT', () => {
    appLogger.info(`Bye!`);
    process.exit(0);
});