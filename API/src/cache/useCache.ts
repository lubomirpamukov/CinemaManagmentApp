const cache = new Map<string, { data: any, expiry: number}>();

/**
 * In memory chache
 * @param key The unique key for the cache entry
 * @param ttl Time To Live in milliseconds
 * @param fetchData A function that fetches the data if its not in the cache.
 */

export async function useCache<T>( key: string, ttl: number, fetchData:() => Promise<T>): Promise<T> {
    const now = Date.now();
    const existing = cache.get(key); //get cached data

    if (existing && now < existing.expiry) { // checking if caching data is valid
        return existing.data as T
    }

    // cache is invalid or dosn't exist, refetch new data
    const data = await fetchData();

    // store new data in the cache with a new expiry time 
    cache.set(key, { data, expiry: now + ttl});

    return data;

}