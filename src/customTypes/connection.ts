import { Request as ExpressRequest } from 'express';

export interface Request extends ExpressRequest {
    userID?: number; 
    file?: Express.Multer.File;
}
