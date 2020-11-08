import mongoose from './db';

const fileSchema = new mongoose.Schema({
    originalName: String,
    s3Path: String,
    iv: String,
    id: String,
    etag: String,
    size:  Number,
    expiry: Date
});

export interface file extends mongoose.Document {
    originalName: string,
    s3Path: string,
    iv: string,
    id: string,
    etag: string,
    size: number,
    expiry: Date
};

export default mongoose.model<file>('file', fileSchema);