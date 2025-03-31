import http from 'http';
import express from 'express';
import mongoose from 'mongoose';
import './config/logging';
import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { server, mongo } from './config/config';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import dotenv from 'dotenv';
dotenv.config();
export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

let isConnected = false;

export const Main = async () => {
    logging.log('----------------------------------------');
    logging.log('Initializing API');
    logging.log('----------------------------------------');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());

    logging.log('----------------------------------------');
    logging.log('Connect to DB');
    logging.log('----------------------------------------');

    try {
        logging.log('MONGO_CONNECTION: ', process.env.MONGO_URL);
        if (isConnected) {
            logging.log('----------------------------------------');
            logging.log('Using existing connection');
            logging.log('----------------------------------------');
            return mongoose.connection;
        }

        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL environment variable is not set');
        }

        const connection = await mongoose.connect(process.env.MONGO_URL, mongo.MOGO_OPTIONS);
        isConnected = true;
        logging.log('----------------------------------------');
        logging.log('Connected to db', connection.version);
        logging.log('----------------------------------------');
    } catch (error) {
        logging.log('----------------------------------------');
        logging.log('Unable to connect to db');
        logging.error(error);
        logging.log('----------------------------------------');
    }

    logging.log('----------------------------------------');
    logging.log('Logging & Configuration');
    logging.log('----------------------------------------');
    application.use(loggingHandler);
    application.use(corsHandler);

    logging.log('----------------------------------------');
    logging.log('Define Controller Routing');
    logging.log('----------------------------------------');

    application.use('/users', userRouter);
    application.use('/auth', authRouter);


    logging.log('----------------------------------------');
    logging.log('Define Routing Error');
    logging.log('----------------------------------------');
    application.use(routeNotFound);

    logging.log('----------------------------------------');
    logging.log('Starting Server');
    logging.log('----------------------------------------');
    httpServer = http.createServer(application);
    httpServer.listen(server.SERVER_PORT, () => {
        logging.log('----------------------------------------');
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
        logging.log('----------------------------------------');
    });
};

export const Shutdown = () => {
    return new Promise((resolve, reject) => {
        if (httpServer) {
            httpServer.close((err) => {
                if (err) return reject(err);
                resolve(true);
            });
        } else {
            resolve(true);
        }
    });
};

Main();
