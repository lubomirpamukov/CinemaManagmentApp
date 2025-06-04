import { Model, Document } from 'mongoose';

interface PaginationResult<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
}

interface PaginationOptions {
    page: number;
    limit: number;
    searchQuery?: object;
    selectFields?: string;
}

export const paginate = async <T extends Document>(model: Model<T>, options: PaginationOptions): Promise<PaginationResult<T>> => {
    const { page, limit, searchQuery = {}, selectFields = '' } = options;

    const skip = (page - 1) * limit;

    const [totalItems, data] = await Promise.all([
        model.countDocuments(searchQuery),
        model.find(searchQuery).skip(skip).limit(limit).select(selectFields) // Fetch paginated data
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        data,
        totalPages,
        currentPage: page
    };
};
