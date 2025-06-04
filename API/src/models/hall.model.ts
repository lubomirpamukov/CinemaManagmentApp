import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISeat {
    row: number;
    column: number;
    seatNumber: string;
    isAvailable: 'reserved' | 'available' | 'sold';
    type: 'regular' | 'vip' | 'couple';
    price: number;
}

export interface IMovieProgram {
    movieId: string;
    startTime: string;
    endTime: string;
}

export interface IHall extends Document {
    cinemaId: Types.ObjectId | string;
    name: string;
    layout: {
        rows: number;
        columns: number;
    };
    movieProgram: IMovieProgram[];
    seats: ISeat[];
}

const SeatSchema = new Schema<ISeat>({
    row: {
        type: Number,
        required: true
    },
    column: {
        type: Number,
        required: true
    },
    seatNumber: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 10
    },
    isAvailable: {
        type: String,
        enum: ['reserved', 'available', 'sold'],
        required: true
    },
    type: {
        type: String,
        enum: ['regular', 'vip', 'couple'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const MovieProgramSchema = new Schema<IMovieProgram>({
    movieId: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    }
});

const HallSchema = new Schema<IHall>({
    cinemaId: {
        type: Schema.Types.ObjectId,
        ref: 'Cinema',
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    layout: {
        rows: {
            type: Number,
            required: true,
            min: 1,
            max: 50
        },
        columns: {
            type: Number,
            required: true,
            min: 1,
            max: 50
        }
    },
    movieProgram: { type: [MovieProgramSchema], default: [] },
    seats: { type: [SeatSchema], default: [] }
});

const Hall = mongoose.model<IHall>('Hall', HallSchema);
export default Hall;
export { HallSchema, SeatSchema, MovieProgramSchema };
