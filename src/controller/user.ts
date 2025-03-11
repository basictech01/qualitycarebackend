import validateRequest from '@middleware/validaterequest';
import { UserService } from '@services/user';
import { Router, Response, NextFunction } from 'express';
import { Request } from '@customTypes/connection';
import z from 'zod';
import { successResponse } from '@utils/reponse';
import { hash } from 'bcryptjs';

var router = Router();
const userService = new UserService();

const SCHEMA = {
    REGISTER: z.object({
        email_address: z.string().email().max(512),
        password: z.string().min(1),
        full_name: z.string().min(1),
        phone_number: z.string().min(1),
        national_id: z.string().optional(),
        photo_url: z.string().optional(),
    }),
    VERIFY_USER: z.object({
        hash: z.string().min(1),
        otp: z.number().min(1)
    }),
    LOGIN_EMAIL: z.object({
        email_address: z.string().email().max(512),
        password: z.string().min(1)
    })
}

router.post('/register',
    validateRequest({
        body: SCHEMA.REGISTER
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.REGISTER> = req.body
        try {
            const hash = await userService.createRegisterUserHash(body.email_address, body.password, body.full_name, body.phone_number, body.national_id, body.photo_url);
            res.send(successResponse({hash}));   
        } catch(e) {
            next(e)
        }
    }
)

router.post('/verify_user', 
    validateRequest({
        body: SCHEMA.VERIFY_USER
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.VERIFY_USER> = req.body
        try {
            const user = await userService.verifyUserAndCreate(body.hash, body.otp);
            res.send(successResponse(user));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/login_email',
    validateRequest({
        body: SCHEMA.LOGIN_EMAIL
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.LOGIN_EMAIL> = req.body
        try {
            console.log( body.email_address)
            const user = await userService.loginWithEmailPassword(body.email_address, body.password);
            res.send(successResponse(user));
        } catch(e) {
            next(e)
        }
    }
)



export default router;