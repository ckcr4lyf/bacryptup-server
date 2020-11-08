import mongoose from 'mongoose';
import Logger from '../utilities/logger';

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const mongo_uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0-kbw7e.mongodb.net/test?retryWrites=true&w=majority`;
const dbLogger = new Logger('MONGO');

mongoose.connect(mongo_uri, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useFindAndModify: false,
    useCreateIndex: true
});

mongoose.connection.on('connected', () => {
    dbLogger.info(`Connected to MongoDB`);
});

mongoose.connection.on('error', (err) => {
    dbLogger.error(`MongoDB connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    dbLogger.info(`MongoDB disconnected.`);
});

export default mongoose;