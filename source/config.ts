import { resolve } from 'path';
import { config } from 'dotenv';

config({
    path: resolve(__dirname, '../.env')
});

export const FILE_LIMIT = parseInt(process.env.FILE_LIMIT) || 1024 * 1024 * 25; //25MB default
export const TOTAL_SPACE = parseInt(process.env.TOTAL_SPACE) || 1024 * 1024 * 1024; //default 1GB
export const MAX_EXPIRY = parseInt(process.env.MAX_EXPIRY) || 1000 * 60 * 60 * 24; //Max 1 day
export const FOLDER_NAME = process.env.FOLDER_NAME || 'anon';