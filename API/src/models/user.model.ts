import mongoose, { Document ,Schema } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    role: UserRole;
    hash: string;
    name?: string;
    userName: string;
    email: string;
    password: string;
    contact?: string;
    address?: {
        line1: string;
        city: string;
        state: string;
        zipcode: string;
    };
    geolocation?: { lat: number; long: number };
    /* reservations?:Reservation[] */
}

const UserSchema: Schema = new Schema(
    {
        role: { type: String, enum: ['admin', 'user'], required: true, default: 'user' },
        hash: { type: String },
        name: { type: String },
        userName: {type: String, required: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        contact: { type: String },
        address: {
            line1: String,
            city: String,
            state: String,
            zipcode: String
        },
        geolocation: {
            lat: Number,
            long: Number
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
