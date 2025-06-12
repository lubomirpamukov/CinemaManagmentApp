import mongoose, { Schema, Document, Types } from 'mongoose';
import { SeatType } from './reservation.model';
import { boolean } from 'zod';

export interface ISeat {
    _id: Types.ObjectId;
    row: number;
    column: number;
    seatNumber: string;
    isAvailable: boolean;
    type: SeatType;
    price: number;
}

export interface IHall extends Document {
    cinemaId: Types.ObjectId | string;
    name: string;
    layout: {
        rows: number;
        columns: number;
    };
    seats: ISeat[];
}

const SeatSchema = new Schema<ISeat>(
    {
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
            type: Boolean,
            required: true
        },
        type: {
            type: String,
            enum: Object.values(SeatType),
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    { _id: true }
);


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
    seats: { type: [SeatSchema], default: [] }
});

const Hall = mongoose.model<IHall>('Hall', HallSchema);
export default Hall;
export { HallSchema, SeatSchema };
