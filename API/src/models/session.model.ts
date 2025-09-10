import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
    _id: mongoose.Types.ObjectId;
    cinemaId: mongoose.Types.ObjectId;
    hallId: mongoose.Types.ObjectId;
    movieId: mongoose.Types.ObjectId;
    availableSeats: number;
    startTime: Date; // "HH:MM"
    endTime: Date; // "HH:MM"
}

const SessionSchema: Schema<ISession> = new Schema(
    {
        cinemaId: {
            type: Schema.Types.ObjectId,
            ref: 'Cinema',
            required: true,
            trim: true
        },
        hallId: {
            type: Schema.Types.ObjectId,
            ref: 'Hall',
            required: true,
            trim: true
        },
        movieId: {
            type: Schema.Types.ObjectId,
            ref: 'Movie',
            required: true,
            trim: true
        },
        availableSeats: {
            type: Number,
            required: true
        },
        startTime: {
            type: Date,
            required: true,
            trim: true
        },
        endTime: {
            type: Date,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

const Session = mongoose.model<ISession>('Session', SessionSchema);
export default Session;
