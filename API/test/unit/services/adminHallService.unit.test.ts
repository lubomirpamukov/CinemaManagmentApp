import { beforeEach, describe, expect } from '@jest/globals';
import Hall from '../../../src/models/hall.model';
import Cinema from '../../../src/models/cinema.model';
import mongoose, { Error } from 'mongoose';
import { createHallService, deleteHallByIdService, getCinemaHallsService, getHallByIdService } from '../../../src/services';
import { THall } from '../../../src/utils';
import { mapHallToTHall } from '../../../src/utils/mapping-functions';

jest.mock('../../../src/models/hall.model');

jest.mock('../../../src/models/cinema.model');

/**
 * Helper method that creates mock cinema
 */
export const createMockCinema = (overrides = {}) => ({
    _id: '60f7c0d5b4d1c2001c8e4a01',
    city: 'Sofia',
    name: 'Arena Mladost',
    halls: [
        '64e8b2f1c2a1b2c3d4e5f6a7', // Hall 1 ID
        '64e8b2f1c2a1b2c3d4e5f6a8' // Hall 2 ID
    ],
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
 * Helper to create a valid THall input object for testing createHallService.
 * @param overrides Optional properties to override the defaults.
 */
export function createTHallInput(overrides: Partial<THall> = {}): THall {
    return {
        cinemaId: '60f7c0d5b4d1c2001c8e4a01',
        name: 'Test Hall',
        layout: {
            rows: 5,
            columns: 10
        },
        seats: [
            {
                type: 'regular',
                row: 1,
                column: 1,
                seatNumber: 'A1',
                price: 10,
                originalSeatId: 'seatid1',
                isAvailable: true
            },
            {
                type: 'vip',
                row: 1,
                column: 2,
                seatNumber: 'A2',
                price: 15,
                originalSeatId: 'seatid2',
                isAvailable: false
            }
        ],
        ...overrides
    };
}

/**
 * Helper to create mock hall object
 */
const createMockHalls = (overrides = {}) => [
    {
        _id: '64e8b2f1c2a1b2c3d4e5f6a7',
        name: 'Hall 1',
        cinemaId: '64e8b2f1c2a1b2c3d4e5f6b8',
        layout: { rows: 5, columns: 10 },
        seats: [
            {
                _id: '64e8b2f1c2a1b2c3d4e5f6c9',
                row: 1,
                column: 1,
                seatNumber: 'A1',
                isAvailable: true,
                type: 'couple',
                price: 10
            },
            {
                _id: '64e8b2f1c2a1b2c3d4e5f6d0',
                row: 1,
                column: 2,
                seatNumber: 'A2',
                isAvailable: false,
                type: 'vip',
                price: 15
            }
        ]
    },
    {
        _id: '64e8b2f1c2a1b2c3d4e5f6a8',
        name: 'Hall 2',
        cinemaId: '64e8b2f1c2a1b2c3d4e5f6b8',
        layout: { rows: 3, columns: 8 },
        seats: []
    }
];

/**
 * Helper method to create Cinema DTO
 */
export const createExpectedCinema = (overrides = {}) => ({
    id: '60f7c0d5b4d1c2001c8e4a01',
    city: 'Sofia',
    name: 'Arena Mladost',
    halls: [
        '64e8b2f1c2a1b2c3d4e5f6a7', // Hall 1 ID
        '64e8b2f1c2a1b2c3d4e5f6a8' // Hall 2 ID
    ],
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
 * Helper to create mock HallDTO
 */

const createExpectedHalls = (overrides = {}): THall[] => [
    {
        id: '64e8b2f1c2a1b2c3d4e5f6a7',
        name: 'Hall 1',
        cinemaId: '64e8b2f1c2a1b2c3d4e5f6b8',
        layout: { rows: 5, columns: 10 },
        seats: [
            {
                originalSeatId: '64e8b2f1c2a1b2c3d4e5f6c9',
                row: 1,
                column: 1,
                seatNumber: 'A1',
                isAvailable: true,
                type: 'couple',
                price: 10
            },
            {
                originalSeatId: '64e8b2f1c2a1b2c3d4e5f6d0',
                row: 1,
                column: 2,
                seatNumber: 'A2',
                isAvailable: false,
                type: 'vip',
                price: 15
            }
        ]
    },
    {
        id: '64e8b2f1c2a1b2c3d4e5f6a8',
        name: 'Hall 2',
        cinemaId: '64e8b2f1c2a1b2c3d4e5f6b8',
        layout: { rows: 3, columns: 8 },
        seats: []
    }
];

/**
 * Helper function that creates mockHallInstance
 * and take options to change .save() functionality
 * @example const mockHallInstance = makeMockHallInstance(hallInput, {
    save: jest.fn().mockRejectedValueOnce(new Error(errorMsg))
});
 */
export const makeMockHallInstance = (
    hallInput: THall,
    options?: {
        save?: () => any;
        _id?: any;
    }
) => {
    const _id = options?._id || new mongoose.Types.ObjectId();
    const save = options?.save || jest.fn().mockResolvedValueOnce(undefined);
    const mockHallInstance = { ...hallInput, _id, save };
    (Hall as unknown as jest.Mock).mockImplementation(() => mockHallInstance);
    return mockHallInstance;
};

/**
 * Unit tests for getCinemasHallService
 *
 * This test suite verifies;
 * - That all halls for a given cinema ID are fetched and mapped correctly.
 * - That the correct DTO structure is returned for each hall.
 * - That an error is thrown if the cinema does not exist.
 * - That an empty array is returned if the cinema exists but has no halls.
 * - That database errors from Cinema or Hall queries are properly propagated.
 * - That halls with null or undefined seats arrays are handled gracefully.
 * - That the database is queried with the correct filter parameters.
 */

describe('getCinemaHallsService', () => {

    it('should fetch all halls for a cinema', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const mockedHalls = createMockHalls();
        const expectedHalls = createExpectedHalls();

        (Hall.find as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockedHalls)
        });

        (Cinema.findById as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockCinema)
        });

        // Act
        const actualHalls = await getCinemaHallsService(mockCinema._id);

        // Assert
        expect(actualHalls).toEqual(expectedHalls);
        expect(Hall.find).toHaveBeenCalledWith({ cinemaId: mockCinema._id });
    });

    it('should throw Cinema not found if cinema dont exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidCinemaId = new mongoose.Types.ObjectId();
        (Cinema.findById as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(null)
        });

        // Act & Assert
        await expect(getCinemaHallsService(invalidCinemaId)).rejects.toThrow('Cinema not found');
        expect(Cinema.findById).toHaveBeenCalledWith(invalidCinemaId);
    });

    it('should return empty array if cinema has no halls', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockedCinema = createMockCinema({ halls: [] });

        (Cinema.findById as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockedCinema)
        });

        (Hall.find as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce([])
        });

        // Act
        const actualResult = await getCinemaHallsService(mockedCinema._id);

        // Assert
        expect(actualResult).toEqual([]);
        expect(Cinema.findById).toHaveBeenCalledWith(mockedCinema._id);
        expect(Hall.find).toHaveBeenCalledWith({ cinemaId: mockedCinema._id });
    });

    it('should throw error if database error occures in Cinema.findById', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const expectedResult = 'Database connection lost';
        (Cinema.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockRejectedValue(new Error(expectedResult))
        });

        // Act & Assert
        await expect(getCinemaHallsService(mockCinema._id)).rejects.toThrow(expectedResult);
        expect(Cinema.findById).toHaveBeenCalledWith(mockCinema._id);
    });

    it('should throw error if database error occures in Hall.find', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockCinema = createMockCinema();
        const expectedResult = 'Database connection lost';

        (Cinema.findById as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockCinema)
        });
        (Hall.find as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockRejectedValueOnce(new Error(expectedResult))
        });

        // Act & Assert
        await expect(getCinemaHallsService(mockCinema._id)).rejects.toThrow(expectedResult);
        expect(Cinema.findById).toHaveBeenCalledWith(mockCinema._id);
        expect(Hall.find).toHaveBeenCalledWith({ cinemaId: mockCinema._id });
    });
    it('should handle hall.seats being null or undefined gracefully', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockedCinema = createMockCinema();
        const mockedHalls = createMockHalls(); // mockedHalls[1] have no seats

        (Cinema.findById as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockedCinema)
        });
        (Hall.find as jest.Mock).mockReturnValueOnce({
            lean: jest.fn().mockResolvedValueOnce(mockedHalls)
        });

        // Act
        const actualResult = await getCinemaHallsService(mockedCinema._id);
        // Assert
        expect(actualResult[1].seats).toEqual([]);
        expect(Cinema.findById).toHaveBeenCalledWith(mockedCinema._id);
        expect(Hall.find).toHaveBeenCalledWith({ cinemaId: mockedCinema._id });
    });
});



/**
 * Unit tests for createHallService
 *
 * This test suite verifies:
 * - That a new hall document is created and returned correctly when valid data is provided.
 * - That the Hall model is called with the correct input and the save method is called with the session.
 * - That an error is thrown if the hall data is invalid (e.g., missing required fields), simulating Mongoose validation errors.
 * - That a MongoDB transaction session is passed to the save method if provided.
 * - That database errors (such as connection loss) thrown by the save method are properly propagated.
 *
 * Mocks are used for the Hall model and its instance methods to isolate service logic from database operations.
 */

describe('createHallService', () => {

    it('should create a new hall document if hall data is valid', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallInput = createTHallInput();
        const mockSession = { id: 'session1' } as unknown as mongoose.ClientSession;

        //Mock Hall instance
        const mockHallInstance = makeMockHallInstance(hallInput);

        // Remove save before mapping to DTO
        const { save, ...hallDoc } = mockHallInstance;
        const expectedResult = mapHallToTHall(hallDoc as any);

        // Act
        const actualResult = await createHallService(hallInput, mockSession);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Hall).toHaveBeenCalledWith(hallInput);
        expect(mockHallInstance.save).toHaveBeenCalledWith({ session: mockSession });
    });

    it('should throw error if hallData is not valid', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallInput = createTHallInput();
        const { cinemaId, ...invalidHallInput } = hallInput;
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;

        //Mock Hall instance
        const mockHallInstance = makeMockHallInstance(invalidHallInput as any, {
            save: jest.fn().mockRejectedValueOnce(new mongoose.Error.ValidationError())
        });

        // Act & Assert
        await expect(createHallService(invalidHallInput as any, mockSession)).rejects.toThrow(mongoose.Error.ValidationError);
        expect(Hall).toHaveBeenCalledWith(invalidHallInput);
        expect(mockHallInstance.save).toHaveBeenCalledWith({ session: mockSession });
    });

    it('should open a MongoDB transaction session if provided', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallInput = createTHallInput();
        const mockSession = { id: 'Mock-Session' } as unknown as mongoose.ClientSession;

        //Mock Hall instance
        const mockHallInstance = makeMockHallInstance(hallInput);
        //Act
        const actualResult = await createHallService(hallInput, mockSession);

        // Arrange
        expect(mockHallInstance.save).toHaveBeenCalledWith({ session: mockSession });
    });

    it('should throw database error if connection is lost', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallInput = createTHallInput();
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        const errMsg = 'Connection Error';
        // Mock Hall instance
        const mockHallInstance = makeMockHallInstance(hallInput, {
            save: jest.fn().mockRejectedValue(new mongoose.Error(errMsg))
        });

        // Act & Assert
        await expect(createHallService(hallInput, mockSession)).rejects.toThrow(errMsg);
        expect(mockHallInstance.save).toHaveBeenCalledWith({ session: mockSession });
        expect(Hall).toHaveBeenCalledWith(hallInput);
    });
});

/**
 * Unit test for deleteHallByIdService
 *
 * This test suite verifies:
 * - That the service deletes and returns the hall document if it exists.
 * - That the service returns null if the hall document does not exist.
 * - That the Hall model's findByIdAndDelete function is called with the correct hall id and session.
 * - That a MongoDB transaction session is passed to the delete operation if provided.
 * - That database errors (such as connection loss) thrown by the delete operation are properly propagated.
 *
 * Mock are used for the Hall model's static methods to isolate service logic from database operations.
 */

describe('deleteHallByIdService', () => {

    it('should delete hall document if exists', async () => {
        // Arrange
        jest.clearAllMocks();
        const mockhalls = createMockHalls();
        const hallToDelete = mockhalls[0];
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;

        //Mock Hall.findByIdAndDelete method
        (Hall.findByIdAndDelete as jest.Mock).mockResolvedValue(hallToDelete);

        //Act
        const actualResult = await deleteHallByIdService(hallToDelete._id, mockSession);

        // Assert
        expect(actualResult).toEqual(hallToDelete);
        expect(Hall.findByIdAndDelete).toHaveBeenCalledWith(hallToDelete._id, { session: mockSession });
    });

    it('should return null if hall document dont exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId().toString();
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Hall.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

        // Act
        const actualResponse = await deleteHallByIdService(randomId, mockSession);

        // Assert
        expect(actualResponse).toBe(null);
        expect(Hall.findByIdAndDelete).toHaveBeenCalledWith(randomId, { session: mockSession });
    });
    it('should pass session for transaction if provided', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId().toString();
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Hall.findByIdAndDelete as jest.Mock).mockResolvedValue(undefined);

        // Act
        const actualResult = await deleteHallByIdService(randomId, mockSession);

        // Assert
        expect(actualResult).toBe(undefined);
        expect(Hall.findByIdAndDelete).toHaveBeenCalledWith(randomId, { session: mockSession });
    });
    it('should propagate error if database throws error', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId().toString();
        const errMsg = 'Database connection error';
        (Hall.findByIdAndDelete as jest.Mock).mockRejectedValue(new mongoose.Error(errMsg));

        //Act & Assert
        await expect(deleteHallByIdService(randomId)).rejects.toThrow(new mongoose.Error(errMsg));
        expect(Hall.findByIdAndDelete).toHaveBeenCalledWith(randomId, { session: undefined });
    });
});

describe('getHallByIdService', () => {
   
    it('should throw error if called with invalid hall id format', async () => {
        // Arrange
        jest.clearAllMocks();
        const invalidIdFormat = 'asdf';

        //Act & Assert
        await expect(getHallByIdService(invalidIdFormat)).rejects.toThrow('Invalid Hall id format');
    });

    it('should return null if hall dont exist', async () => {
        // Arrange
        jest.clearAllMocks();
        const randomId = new mongoose.Types.ObjectId();
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Hall.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(null)
        });

        // Act
        const actualResult = await getHallByIdService(randomId, mockSession);

        // Assert
        expect(actualResult).toBe(null);
        expect(Hall.findById).toHaveBeenCalledWith(randomId, { session: mockSession });
    });
    it('should pass session if provided', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallData = createMockHalls()[0];
        const expectedResult = createExpectedHalls()[0];
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Hall.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(hallData) // 1 hall object
        });

        // Act
        const actualResult = await getHallByIdService(hallData._id, mockSession);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Hall.findById).toHaveBeenCalledWith(hallData._id, { session: mockSession });
    });
    it('should return Hall DTO if Successful', async () => {
        // Arrange
        jest.clearAllMocks();
        const hallData = createMockHalls()[0];
        const expectedResult = createExpectedHalls()[0];
        const mockSession = { id: 'mock-session' } as unknown as mongoose.ClientSession;
        (Hall.findById as jest.Mock).mockReturnValue({
            lean: jest.fn().mockResolvedValue(hallData) // 1 hall object
        });

        // Act
        const actualResult = await getHallByIdService(hallData._id, mockSession);

        // Assert
        expect(actualResult).toEqual(expectedResult);
        expect(Hall.findById).toHaveBeenCalledWith(hallData._id, { session: mockSession });
    });
});
