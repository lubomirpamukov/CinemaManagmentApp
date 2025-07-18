import Session from '../models/session.model';
import mongoose from 'mongoose';

/**
 * Deletes all sessions assosicated with the specific hall ID.
 * @param {string} hallId The ID of the hall whose sessions will be deleted.
 * @param {mongoose.ClientSession} [session] The Mongoose session for the transaction.
 */
export const deleteSessionsByHallIdService = async (hallId: string, session?: mongoose.ClientSession): Promise<void> => {
    await Session.deleteMany({ hallId: hallId }, { session });
};
