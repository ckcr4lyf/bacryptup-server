import './config';
import express from 'express';
import http from 'http';
import router from './api/router';
import { performance } from 'perf_hooks';
import Logger from './utilities/logger';

declare global {
    namespace Express {
        interface Request {
            __startAt: number
        }
    }
}

const app = express();
const httpLogger = new Logger("HTTP");

app.use(express.json());
app.disable('x-powered-by');
app.disable('etag');

app.use((req, res, next) => {
    req.__startAt = performance.now();
    res.on('finish', () => {
        const timeTaken = performance.now() - req.__startAt;
        httpLogger.info(`${req.method} ${req.baseUrl}${req.path} ${res.statusCode} in ${timeTaken.toFixed(2)}ms`);
    });
    next();
})

app.use('/v1', router);

const IP = process.env.IP || '127.0.0.1';
const PORT = parseInt(process.env.PORT) || 3000;

http.createServer(app).listen(PORT, IP, () => {
    console.log(`Server started at ${IP}:${PORT}`);
});

process.on('SIGINT', () => {
    console.log(`Bye!`);
    process.exit(0);
});