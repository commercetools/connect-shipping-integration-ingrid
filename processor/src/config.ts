import dotenv from 'dotenv';

dotenv.config();

export const API_KEY = process.env.INGRID_API_KEY as string;
export const API_URL = process.env.INGRID_API_URL as string;
