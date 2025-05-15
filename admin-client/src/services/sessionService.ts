import { Session, sessionSchema } from "../utils";

const BASE_URL = "http://localhost:3123/admin";

export const createSession = async (cinemaId:string, hallId: string,session: Session): Promise<Session> => {
    const url = `${BASE_URL}/cinemas/${cinemaId}/halls/${hallId}/sessions`;
    const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(session),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create session: ${errorText}`);
    }

    const data = await response.json();
    console.log("Session created:", data);
    return sessionSchema.parse(data);
};