import mongoose from 'mongoose';
import { deleteSessionsByHallIdService } from '../../../src/services/adminSessionService';
import Session from '../../../src/models/session.model';
import { beforeEach } from 'node:test';

jest.mock('../../../src/models/session.model');

/**
 * Unit tests for deleteSessionsByHallIdService
 *
 * This test suite verifies that the service correctly interacts with the session model.
 * It ensures that:
 * - The `Session.deleteMany` method is called with the correct hall ID filter.
 * - The optional transaction session parameter is correctly passed to the model.
 * - Any errors from the database operation are properly propagated up.
 */
describe('deleteSessionsByHallIdService', () => {

    it('should call Session.deleteMany with the correct hallId', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomHallId = new mongoose.Types.ObjectId();
        (Session.deleteMany as jest.Mock).mockResolvedValue({ acknowledged: true, deletedCount: 5 });

        // Act
        const actualResult = await deleteSessionsByHallIdService(randomHallId);

        // Assert
        expect(Session.deleteMany).toHaveBeenCalledWith({ hallId: randomHallId }, { session: undefined });
        expect(Session.deleteMany).toHaveBeenCalledTimes(1);
    });

    it('should call Session.deleteMany with the correct hallID and session', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallId = new mongoose.Types.ObjectId();
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Session.deleteMany as jest.Mock).mockResolvedValue({ acknowledged: true, deletedCount: 5 });

        // Act
        const actualResult = await deleteSessionsByHallIdService(hallId, mockSession);

        // Assert
        expect(Session.deleteMany).toHaveBeenCalledWith({ hallId }, { session: mockSession });
    });

    it('should propagate an error if Session.deleteMany fails', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallId = new mongoose.Types.ObjectId();
        const dbError = new Error('Database error');
        (Session.deleteMany as jest.Mock).mockRejectedValue(dbError);

        //Act & Assert
        await expect(deleteSessionsByHallIdService(hallId)).rejects.toThrow(dbError);
        expect (Session.deleteMany).toHaveBeenCalledWith({ hallId}, { session: undefined});
    })
});
