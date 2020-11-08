import { resolve } from 'path';
import { config } from 'dotenv';

config({
    path: resolve(__dirname, '../.env')
});

export const TOTAL_SPACE = parseInt(process.env.TOTAL_SPACE) || 1024 * 1024 * 1024; //default 1GB