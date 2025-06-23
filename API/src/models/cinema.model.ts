import mongoose, { Document, Schema } from 'mongoose';
import { SnackValidation, CinemaValidation } from '../utils/CinemaValidation';


export interface ISnack extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    price: number;
}

export interface ICinema extends Document {
    _id: mongoose.Types.ObjectId;
    city: string;
    name: string;
    halls: string[];
    snacks: ISnack[];
    imgURL?: string;
}

const SnackSchema: Schema<ISnack> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Snack name is required'],
            minlength: [1, SnackValidation.snackName],
            maxlength: [100, SnackValidation.snackName],
            trim: true
        },
        description: {
            type: String,
            minlength: [1, SnackValidation.snackDescription],
            maxlength: [300, SnackValidation.snackDescription],
            trim: true,
            required: false
        },
        price: {
            type: Number,
            required: [true, 'Snack price is required.'],
            min: [0.1, SnackValidation.snackPrice],
            max: [1000, SnackValidation.snackPrice]
        }
    },
    { _id: true }
);

const CinemaSchema: Schema<ICinema> = new Schema(
    {
        city: {
            type: String,
            required: [true, 'City is required.'],
            minlength: [3, CinemaValidation.city],
            maxlength: [150, CinemaValidation.city],
            trim: true
        },
        name: {
            type: String,
            required: [true, CinemaValidation.name],
            minlength: [4, CinemaValidation.name],
            trim: true
        },
        halls: {
            type: [String],
            required: false
        },
        snacks: {
            type: [SnackSchema],
            required: false
        },
        imgURL: {
            type: String,
            trim: true,
            required: false
        }
    },
    {
        timestamps: true,
        _id: true
    }
);

const Cinema = mongoose.model<ICinema>('Cinema', CinemaSchema);
export default Cinema;
