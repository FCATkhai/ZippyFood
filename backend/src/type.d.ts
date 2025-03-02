// import { Request } from 'express';
export {};
declare global {
  namespace Express {
    interface Request {
      user?: {id: string}; // Adjust the type according to your user object structure
    }
  }
}