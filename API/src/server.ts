import http from 'http';
import express, { NextFunction, Request, Response } from 'express';
import mongoose, { Error } from 'mongoose';
import cookieParser from 'cookie-parser';
import './config/logging';
import { corsHandler } from './middleware/corsHandler';
import { loggingHandler } from './middleware/loggingHandler';
import { routeNotFound } from './middleware/routeNotFound';
import { server, mongo } from './config/config';
import userRouter from './routes/user.routes';
import authRouter from './routes/auth.routes';
import adminRouter from './routes/admin.routes';
import reservationRouter from './routes/reservation.routes';
import sessionRouter from './routes/session.routes';
import hallsRouter from './routes/halls.routes';
import movieRouter from './routes/movie.routes';
import cinemaRouter from './routes/cinema.routes';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
dotenv.config();
export const application = express();
export let httpServer: ReturnType<typeof http.createServer>;

let isConnected = false;

export const Main = async () => {
    logging.log('Initializing API');
    application.use(express.urlencoded({ extended: true }));
    application.use(express.json());
    logging.log('Connect to DB');

    try {
        logging.log('MONGO_CONNECTION: ', process.env.MONGO_URL);
        if (isConnected) {
            logging.log('Using existing connection');
            return mongoose.connection;
        }

        if (!process.env.MONGO_URL) {
            throw new Error('MONGO_URL environment variable is not set');
        }

        // Connects to local mongodb database for testing
        if (process.env.NODE_ENV === 'test') {
            process.env.MONGO_URL = 'mongodb://localhost/CinemaManagment_test';
        }

        const connection = await mongoose.connect(process.env.MONGO_URL, mongo.MOGO_OPTIONS);
        isConnected = true;
        logging.log('Connected to db', connection.version);
    } catch (error) {
        logging.log('Unable to connect to db');
        logging.error(error);
    }

    logging.log('Logging & Configuration');
    application.use(loggingHandler);
    application.use(corsHandler);
    application.use(cookieParser());
    logging.log('Define Controller Routing');

    //Routes
    application.use('/users', userRouter);
    application.use('/auth', authRouter);
    application.use('/admin', adminRouter);
    application.use('/reservation', reservationRouter);
    application.use('/session', sessionRouter);
    application.use('/halls', hallsRouter);
    application.use('/movies', movieRouter);
    application.use('/cinemas', cinemaRouter);

    logging.log('Define Routing Error');
    application.use(routeNotFound);

    application.use(errorHandler)

    logging.log('Starting Server');
    httpServer = http.createServer(application);
    httpServer.listen(server.SERVER_PORT, () => {
        logging.log(`Server started on ${server.SERVER_HOSTNAME}:${server.SERVER_PORT}`);
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
