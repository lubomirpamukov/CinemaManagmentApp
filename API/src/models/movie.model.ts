import mongoose, { Document, Schema } from 'mongoose';

// Interface defining the structure of a Cast Member subdocument
interface ICastMember {
    name: string;
    role: string;
}

// Interface defining the structure of a Movie document, extending Mongoose's Document
export interface IMovie extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    duration: number;
    pgRating: string;
    genre: string;
    year: number;
    director: string;
    cast: ICastMember[];
    description: string;
    imgURL?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Schema for the Cast Member subdocument
const CastMemberSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Actor name is required.'],
            minlength: [2, 'Actor name must be at least 2 characters long.'],
            maxlength: [100, 'Actor name cannot exceed 100 characters.'],
            trim: true
        },
        role: {
            type: String,
            required: [true, 'Actor role is required.'],
            minlength: [2, 'Actor role must be at least 2 characters long.'],
            maxlength: [100, 'Actor role cannot exceed 100 characters.'],
            trim: true
        }
    },
    { _id: false }
); // Don't create separate _id for cast members

// Main Movie Schema
const MovieSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Movie title is required.'],
            unique: true,
            minlength: [3, 'Title must be between 3 and 60 characters.'],
            maxlength: [60, 'Title must be between 3 and 60 characters.'],
            trim: true
        },
        duration: {
            type: Number,
            required: [true, 'Movie duration is required.'],
            min: [15, 'Duration must be between 15 and 500 minutes.'],
            max: [500, 'Duration must be between 15 and 500 minutes.']
        },
        pgRating: {
            type: String,
            required: [true, 'PG Rating is required.'],
            trim: true
        },
        genre: {
            type: String,
            required: [true, 'Genre is required.'],
            minlength: [2, 'Genre must be between 2 and 25 characters.'],
            maxlength: [25, 'Genre must be between 2 and 25 characters.'],
            trim: true
        },
        year: {
            type: Number,
            required: [true, 'Year is required.'],
            min: [1850, 'Year must be at least 1850.'],
            max: [new Date().getFullYear(), `Year cannot be in the future.`]
        },
        director: {
            type: String,
            required: [true, 'Director is required.'],
            minlength: [2, 'Director name must be between 2 and 100 characters.'],
            maxlength: [100, 'Director name must be between 2 and 100 characters.'],
            trim: true
        },
        cast: {
            type: [CastMemberSchema], // Array of cast member subdocuments
            validate: [
                // Ensure at least one cast member is provided
                (val: ICastMember[]) => val.length >= 1,
                'At least one cast member is required.'
            ]
        },
        description: {
            type: String,
            required: [true, 'Description is required.'],
            minlength: [10, 'Description must be between 10 and 700 characters.'],
            maxlength: [700, 'Description must be between 10 and 700 characters.'],
            trim: true
        },
        imgURL: {
            type: String,
            required: false,
            trim: true
            // Basic URL validation can be added if needed, though Zod handles it primarily
            // match: [/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i, 'Please fill a valid URL']
        }
    },
    {
        timestamps: true
    }
);

const Movie = mongoose.model<IMovie>('Movie', MovieSchema);

export default Movie;
