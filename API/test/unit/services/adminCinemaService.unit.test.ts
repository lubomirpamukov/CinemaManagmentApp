import {
    getCinemasService,
    getCinemaByIdService,
    updateCinemaByIdService,
    addHallToCinemaService,
    removeHallFromCinemaService
} from '../../../src/services/adminCinemaService';
import Cinema from '../../../src/models/cinema.model';
import { ZodError } from 'zod';
import { describe } from '@jest/globals';
import mongoose from 'mongoose';
jest.mock('../../../src/models/cinema.model');

/**
 * Helper to create a mock cinema document.
 */
export const createMockCinema = (overrides = {}) => ({
    _id: '60f7c0d5b4d1c2001c8e4a01',
    city: 'Sofia',
    name: 'Arena Mladost',
    halls: ['6888a966409dcda3087448da', '6888a978f520ddde1c99595a'],
    imgURL: 'https://example.com/arena.jpg',
    snacks: [
        {
            _id: 'snack1',
            name: 'Popcorn',
            description: 'Large salted popcorn',
            price: 5.0
        }
    ],
    ...overrides
});

/**
 * Helper to create a mock cinema DTO.
 */
export const createExpectedCinema = (overrides = {}) => ({
    id: '60f7c0d5b4d1c2001c8e4a01',
    city: 'Sofia',
    name: 'Arena Mladost',
    halls: ['6888a966409dcda3087448da', '6888a978f520ddde1c99595a'],
    imgURL: 'https://example.com/arena.jpg',
    snacks: [
        {
            id: 'snack1',
            name: 'Popcorn',
            description: 'Large salted popcorn',
            price: 5.0
        }
    ],
    ...overrides
});

/**
 * Unit tests for getCinemasService.
 *
 * This suite verifies:
 * - Successful fetching and mapping of cinemas from the database.
 * - Proper error handling when the database query fails.
 * - Zod validation error handling when the DTO is invalid.
 * - Correct behavior when no cinemas are found (returns empty array).
 */

describe('getCinemasService', () => {

    it('should fetch all cinemas', async () => {
        //arrange
        jest.clearAllMocks();
        const mockCinemas = [
            createMockCinema({
                _id: '60f7c0d5b4d1c2001c8e4a01',
                city: 'Sofia',
                name: 'Arena Mladost',
                halls: ['882c5886-664f-4ead-9880-6ee809763ffb', '66e6ee8c-edea-468f-b104-eefda06e3029'],
                imgURL: 'https://example.com/arena-mladost.jpg',
                snacks: [
                    {
                        _id: 'snack1',
                        name: 'Popcorn',
                        description: 'Large salted popcorn',
                        price: 5.0
                    },
                    {
                        _id: 'snack2',
                        name: 'Cola',
                        description: '500ml soft drink',
                        price: 3.0
                    }
                ]
            }),
            createMockCinema({
                _id: '60f7c0d5b4d1c2001c8e4a02',
                city: 'Plovdiv',
                name: 'Cinema City',
                halls: ['hall1', 'hall2', 'hall3'],
                imgURL: 'https://example.com/cinema-city.jpg',
                snacks: [
                    {
                        _id: 'snack3',
                        name: 'Nachos',
                        description: 'Cheesy nachos with salsa',
                        price: 6.5
                    }
                ]
            }),
            createMockCinema({
                _id: '60f7c0d5b4d1c2001c8e4a03',
                city: 'Varna',
                name: 'Festival Complex',
                halls: [],
                imgURL: 'https://example.com/festival-complex.jpg',
                snacks: []
            })
        ];
        (Cinema.find as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCinemas)
        });

        const expectedCinemas = [
            createExpectedCinema({
                id: '60f7c0d5b4d1c2001c8e4a01',
                halls: ['882c5886-664f-4ead-9880-6ee809763ffb', '66e6ee8c-edea-468f-b104-eefda06e3029'],
                imgURL: 'https://example.com/arena-mladost.jpg',
                snacks: [
                    { id: 'snack1', name: 'Popcorn', description: 'Large salted popcorn', price: 5.0 },
                    { id: 'snack2', name: 'Cola', description: '500ml soft drink', price: 3.0 }
                ]
            }),
            createExpectedCinema({
                id: '60f7c0d5b4d1c2001c8e4a02',
                city: 'Plovdiv',
                name: 'Cinema City',
                halls: ['hall1', 'hall2', 'hall3'],
                imgURL: 'https://example.com/cinema-city.jpg',
                snacks: [{ id: 'snack3', name: 'Nachos', description: 'Cheesy nachos with salsa', price: 6.5 }]
            }),
            createExpectedCinema({
                id: '60f7c0d5b4d1c2001c8e4a03',
                city: 'Varna',
                name: 'Festival Complex',
                halls: [],
                imgURL: 'https://example.com/festival-complex.jpg',
                snacks: []
            })
        ];

        //act
        const actualCinemas = await getCinemasService();
        //assertions
        expect(actualCinemas).toEqual(expectedCinemas);
    });

    it('should throw an error if Cinema.find fails', async () => {
        // Arrange: mock Cinema.find().lean() to throw
        jest.clearAllMocks();
        (Cinema.find as jest.Mock).mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error('Database error'))
        });

        // Act & Assert: expect the service to reject
        await expect(getCinemasService()).rejects.toThrow('Database error');
    });

    it('should throw ZodError if the DTO validation fails', async () => {
        // arrange
        jest.clearAllMocks()
        const invalidCinemas = [
            createMockCinema({
                name: undefined // invalid missing field
            })
        ];

        (Cinema.find as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(invalidCinemas)
        });

        // assert
        await expect(getCinemasService()).rejects.toThrow(ZodError);
    });

    it('should return an empty array if no cinemas are found', async () => {
        // arrange
        jest.clearAllMocks();
        (Cinema.find as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue([])
        });

        //act
        const actualCinemas = await getCinemasService();

        //assert
        expect(actualCinemas).toEqual([]);
    });
});

/**
 * Unit tests for getCinemaByIdService.
 *
 * This suite verifies:
 * - Successful fetching, mapping, and validation of a cinema by ID from the database.
 * - Proper error handling when the cinema is not found (throws `Cinema not found`).
 * - Zod validation error handling when the DTO is invalid (throws ZodError).
 */

describe('getCinemaByIdService', () => {

    it('should return validated cinema object from the database if it exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const expectedCinema = createExpectedCinema();

        (Cinema.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockCinema)
        });

        //act
        const actualCinema = await getCinemaByIdService(mockCinema._id);

        //assert
        expect(actualCinema).toEqual(expectedCinema);
    });

    it('should throw Cinema not found error if no cinema is found', async () => {
        //arrange
        jest.clearAllMocks();
        (Cinema.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error('Cinema not found'))
        });

        // Act && Assert: expect the service to reject
        await expect(getCinemaByIdService('60f7c0d5b4d1c2001c8e4a03')).rejects.toThrow('Cinema not found');
    });

    it('should throw ZodError if data from database fails validation.', async () => {
        // arrange
        jest.clearAllMocks();
        const invalidMockCinema = createMockCinema({ city: undefined });

        (Cinema.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(invalidMockCinema)
        });

        // Act & Assert: expected to throw ZodError
        await expect(getCinemaByIdService('60f7c0d5b4d1c2001c8e4a01')).rejects.toThrow(ZodError);
    });
});

/**
 * Unit tests for updateCinemaByIdService
 *
 * This suite verifies:
 * - Successful update of a cinema's information and correct DTO mapping.
 * - Partial updates where only some fields are changed.
 * - Proper handling when the cinema does not exist (returns null).
 * - Correct error propagation when the database connection fails.
 * - No-op updates when the updates object is empty.
 * - That the service calls the database method with the correct arguemtns.
 */

describe('updateCinemaByIdService', () => {

    it('should update cinema information and return the updated object', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockedCinema = createMockCinema({
            city: 'Plovdiv1',
            name: 'Cinema City1',
            snacks: [
                {
                    _id: 'snack1',
                    name: 'Nachos1',
                    description: 'Cheesy nachos with salsa updated',
                    price: 6.5
                }
            ]
        });

        const updates = {
            city: 'Plovdiv1',
            name: 'Cinema City1',
            snacks: [
                {
                    _id: 'snack1',
                    name: 'Nachos1',
                    description: 'Cheesy nachos with salsa updated',
                    price: 6.5
                }
            ]
        };

        const expetedCinema = createExpectedCinema({
            city: 'Plovdiv1',
            name: 'Cinema City1',
            snacks: [
                {
                    id: 'snack1',
                    name: 'Nachos1',
                    description: 'Cheesy nachos with salsa updated',
                    price: 6.5
                }
            ]
        });

        (Cinema.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockedCinema);

        // Act
        const actualCinema = await updateCinemaByIdService(mockedCinema._id, updates);

        // assertions
        expect(actualCinema).toEqual(expetedCinema);
    });

    it('should partialy update cinema information', async () => {
        // Arrange: original cinema in DB
        jest.clearAllMocks();
        const originalCinema = createMockCinema({ city: 'Plovdiv updated' });

        const expectedCinema = createExpectedCinema({ city: 'Plovdiv updated' });

        const updates = { city: 'Plovdiv updated' };
        const updatedCinema = { ...originalCinema, city: 'Plovdiv updated' };
        (Cinema.findByIdAndUpdate as jest.Mock).mockReturnValue(updatedCinema);

        // Act
        const actualCinema = await updateCinemaByIdService(originalCinema._id, updates);

        // Assert
        expect(actualCinema).toEqual(expectedCinema);
    });

    it('should return null if cinema dont exist in database', async () => {
        // Arrange
        jest.clearAllMocks();
        const updates = { city: 'Plovdiv updated' };
        const randomGuid = '186e908a-41b2-47e1-b3b3-7aff1bdfefde';
        (Cinema.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

        // Act
        const actualCinema = await updateCinemaByIdService(randomGuid, updates);

        // Assert
        expect(actualCinema).toBe(null);
    });

    it('should throw db error if connection is lost.', async () => {
        // Arrange
        jest.clearAllMocks();
        (Cinema.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Database error'));

        //Act & Assert: expect to service to throw error
        await expect(updateCinemaByIdService('random-id', { city: 'Berlin' })).rejects.toThrow('Database error');
    });

    it('should not update cinema information if updates object is empty', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();

        const updates = {};

        const expectedCinema = createExpectedCinema();

        (Cinema.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockCinema);

        // Act
        const actualCinema = await updateCinemaByIdService(mockCinema._id, updates);

        // Assert
        expect(actualCinema).toEqual(expectedCinema);
        expect(Cinema.findByIdAndUpdate).toHaveBeenCalledWith(mockCinema._id, updates, expect.objectContaining({ new: true, runValidators: true }));
    });
});

/**
 * Unit test for addHallToCinemaService
 *
 * This suite verifies:
 * - That a hallId is correctly added to the cinema's halls array.
 * - That no error is thrown and nothing is added if the cinema does not exist.
 * - That adding a hallId alredy present in the halls array does not create duplicate.
 * - That database errors are properly propagated (thrown).
 * - That the session parameter is correctly passed to the database operation.
 */

describe('addHallToCinemaService', () => {
    
    it('should add hallId to cinema.halls array', async () => {
        //Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const hallId = new mongoose.Types.ObjectId();
        const expectedResult = {
            acknowledged: true,
            modifiedCount: 1,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResponse = await addHallToCinemaService(mockCinema._id, hallId);
        // Assert
        expect(actualResponse).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: mockCinema._id }, { $addToSet: { halls: hallId } }, { session: undefined });
    });

    it('should not add hallId to not existing cinema', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidCinemaId = '6888fc17dcd6e4687129ae9b';
        const hallId = '6888fc3b2133da979df94e93';
        const expectedResult = {
            acknowledged: true,
            matchedCount: 0,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        //Act
        const actualResult = await addHallToCinemaService(invalidCinemaId, hallId);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: invalidCinemaId }, { $addToSet: { halls: hallId } }, { session: undefined });
    });

    it('should not add hallId to the cinema if this hallId is alredy in the cinema.halls array', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const existingHallId = mockCinema.halls[0];
        const expectedResult = {
            acknowledged: true,
            matchedCount: 1, // The cinema was found
            modifiedCount: 0, // No change was made (hallId was already present)
            upsertedId: null,
            upsertedCount: 0
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResult = await addHallToCinemaService(mockCinema._id, existingHallId);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: mockCinema._id }, { $addToSet: { halls: existingHallId } }, { session: undefined });
    });

    it('should throw error if database connection fails', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const hallId = new mongoose.Types.ObjectId();
        const databaseError = new Error('MongoDB connection lost: operation timed out');
        (Cinema.updateOne as jest.Mock).mockRejectedValue(databaseError);

        // Act & Assert
        await expect(addHallToCinemaService(mockCinema._id, hallId)).rejects.toThrow('MongoDB connection lost: operation timed out');
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: mockCinema._id }, { $addToSet: { halls: hallId } }, { session: undefined });
    });

    it('should pass session to the database call if provided', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const hallId = new mongoose.Types.ObjectId();

        const mockSession: mongoose.ClientSession = {
            id: new mongoose.mongo.BSON.UUID()
        } as unknown as mongoose.ClientSession; // Cast to ClientSession for type compatibility

        const expectedResult = {
            acknowledged: true,
            modifiedCount: 1,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1
        };

        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResponse = await addHallToCinemaService(mockCinema._id, hallId, mockSession);

        // Assert
        expect(actualResponse).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: mockCinema._id }, { $addToSet: { halls: hallId } }, { session: mockSession });
    });
});

/**
 * Unit test for removeHallFromCinemaService
 *
 * This suite verifies:
 * - That a hallId is correctly removed from the cinema's halls array.
 * - That no error is thrown and nothing is removed if the cinema does not exist.
 * - That removing a hallId not present in the halls array does not modify the database.
 * - That the session parameter is correctly passed to the database operation.
 */

describe('removeHallFromCinemaService', () => {
  
    it('should remove hallId from cinema.halls array', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const hallIdToRemove = mockCinema.halls[0];
        const expectedResult = {
            acknowledged: true,
            matchedCount: 1, // The cinema document was found
            modifiedCount: 1, // The halls array was changed (hallId was removed)
            upsertedId: null,
            upsertedCount: 0
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResult = await removeHallFromCinemaService(mockCinema._id, hallIdToRemove);

        // Assert;
        expect(actualResult).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith(
            { _id: mockCinema._id, halls: hallIdToRemove },
            { $pull: { halls: hallIdToRemove } },
            { session: undefined }
        );
    });
    it('should not remove hallId if cinema dont exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidCinemaId = new mongoose.Types.ObjectId();
        const hallId = new mongoose.Types.ObjectId();
        const expectedResult = {
            acknowledged: true,
            matchedCount: 0,
            modifiedCount: 0,
            upsertedId: null,
            upsertedCount: 0
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResult = await removeHallFromCinemaService(invalidCinemaId, hallId);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: invalidCinemaId, halls: hallId }, { $pull: { halls: hallId } }, { session: undefined });
    });

    it('should not remove hallId if it dosnt exist in cinema.halls array', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const invalidHallId = new mongoose.Types.ObjectId();
        const expectedResult = {
            acknowledged: true,
            matchedCount: 1, // The cinema document was found
            modifiedCount: 0, // No change was made (hallId was not present)
            upsertedId: null,
            upsertedCount: 0
        };
        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResult = await removeHallFromCinemaService(mockCinema._id, invalidHallId);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith(
            { _id: mockCinema._id, halls: invalidHallId },
            { $pull: { halls: invalidHallId } },
            { session: undefined }
        );
    });
    it('should pass session to the database call if provided', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const hallId = new mongoose.Types.ObjectId();

        const mockSession: mongoose.ClientSession = {
            id: new mongoose.mongo.BSON.UUID()
        } as unknown as mongoose.ClientSession; // Cast to ClientSession for type compatibility

        const expectedResult = {
            acknowledged: true,
            modifiedCount: 1,
            upsertedId: null,
            upsertedCount: 0,
            matchedCount: 1
        };

        (Cinema.updateOne as jest.Mock).mockResolvedValue(expectedResult);

        // Act
        const actualResponse = await addHallToCinemaService(mockCinema._id, hallId, mockSession);

        // Assert
        expect(actualResponse).toEqual(expectedResult);
        expect(Cinema.updateOne).toHaveBeenCalledWith({ _id: mockCinema._id }, { $addToSet: { halls: hallId } }, { session: mockSession });
    });
});
