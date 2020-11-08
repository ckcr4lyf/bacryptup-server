import './config';
import express from 'express';
import http from 'http';
import router from './api/router';

const app = express();

app.use(express.json());
app.disable('x-powered-by');
app.disable('etag');
app.use(router);

const IP = process.env.IP || '127.0.0.1';
const PORT = parseInt(process.env.PORT) || 3000;

http.createServer(app).listen(PORT, IP, () => {
    console.log(`Server started at ${IP}:${PORT}`);
});

process.on('SIGINT', () => {
    console.log(`Bye!`);
    process.exit(0):
});