import mongoose, { Document, Schema } from 'mongoose';

export enum ReservationStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    FAILED = 'failed',
    COMPLETED = 'completed'
}

export enum SeatType {
    REGULAR = 'regular',
    VIP = 'vip',
    COUPLE = 'couple'
}

export interface IReservedSeat {
    originalSeatId: mongoose.Types.ObjectId;
    row: number;
    column: number;
    seatNumber: string;
    type: SeatType;
    price: number;
}

export interface IReservation extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    sessionId: mongoose.Types.ObjectId;
    seats: IReservedSeat[];
    totalPrice: number;
    status: ReservationStatus;
    reservationCode?: string;
    createdAt: Date;
    updatedAt: Date;
    //to do: payment info for stripe intergration in the future.
}

const reserveSeatSchema: Schema<IReservedSeat> = new Schema(
    {
        originalSeatId: {
            type: Schema.Types.ObjectId,
            required: true
        },
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
            trim: true
        },
        type: {
            type: String,
            enum: Object.values(SeatType),
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const reservationSchema: Schema<IReservation> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        sessionId: {
            type: Schema.Types.ObjectId,
            ref: 'Session',
            required: true
        },
        seats: [reserveSeatSchema],
        totalPrice: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(ReservationStatus),
            required: true,
            default: ReservationStatus.PENDING
        },
        reservationCode: {
            type: String,
            unique: true,
            sparse: true
        }
    },
    { timestamps: true }
);

export default mongoose.model<IReservation>('Reservation', reservationSchema);
