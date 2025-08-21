import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'admin' | 'user';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    role: UserRole;
    reservations: mongoose.Types.ObjectId[];
    hash: string;
    name?: string;
    email: string;
    password: string;
    contact?: string;
    address?: {
        line1: string;
        city: string;
        state: string;
        zipcode: string;
    };
}

const UserSchema: Schema = new Schema(
    {
        role: { type: String, enum: ['admin', 'user'], required: true, default: 'user' },
        reservations: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Reservation'
            }
        ],
        hash: { type: String },
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        contact: { type: String },
        address: {
            line1: String,
            city: String,
            state: String,
            zipcode: String
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
