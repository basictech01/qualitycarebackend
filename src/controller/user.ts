import validateRequest from '@middleware/validaterequest';
import { UserService } from '@services/user';
import { Router, Response, NextFunction } from 'express';
import { Request } from '@customTypes/connection';
import z from 'zod';
import { successResponse } from '@utils/reponse';
import { verifyAdmin, verifyClient } from '@middleware/auth';
import { ERRORS } from '@utils/error';

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
    }),
    LOGIN_PHONE: z.object({
        phone_number: z.string().min(1)
    }),
    LOGIN_VERIFY: z.object({
        hash: z.string().min(1),
        otp: z.number().min(1)
    }),
    REFRESH_TOKEN: z.object({
        refresh_token: z.string().min(1)
    }),
    UPDATE_USER: z.object({
        email_address: z.string().email().max(512).optional(),
        full_name: z.string().min(1).optional(),
        national_id: z.string().optional(),
        photo_url: z.string().optional(),
    }),
    RESET_PASSWORD: z.object({
        email_address: z.string().email().max(512)
    }),
    RESET_PASSWORD_VERIFY: z.object({
        hash: z.string().min(1),
        otp: z.number().min(1),
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

router.post('/admin_register',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.REGISTER
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.REGISTER> = req.body
        try {
            const hash = await userService.createAdminUser(body.email_address, body.password, body.full_name, body.phone_number);
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
            const user = await userService.loginWithEmailPassword(body.email_address, body.password);
            res.send(successResponse(user));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/login_phone',
    validateRequest({
        body: SCHEMA.LOGIN_PHONE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.LOGIN_PHONE> = req.body
        try {
            const user = await userService.loginWithPhone(body.phone_number);
            res.send(successResponse(user));
        }
        catch(e) {
            next(e)
        }
    }
)

router.post('/login_phone_verify', 
    validateRequest({
        body: SCHEMA.LOGIN_VERIFY
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.LOGIN_VERIFY> = req.body
        try {
            const user = await userService.loginPhoneVerify(body.hash, body.otp);
            res.send(successResponse(user));
        }
        catch(e) {
            next(e)
        }
    }
)

router.post('/refresh_token',
    validateRequest({
        body: SCHEMA.REFRESH_TOKEN
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.REFRESH_TOKEN> = req.body
            const user = await userService.refreshToken(body.refresh_token);
            res.send(successResponse(user));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/reset_password',
    validateRequest({
        body: SCHEMA.RESET_PASSWORD
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.RESET_PASSWORD> = req.body
            const hash = await userService.creteResetPasswordHash(body.email_address);
            res.send(successResponse({hash}))
        } catch(e) {
            next(e)
        }
    }
)

router.post('/reset_password_verify',
    validateRequest({
        body: SCHEMA.RESET_PASSWORD_VERIFY
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.RESET_PASSWORD_VERIFY> = req.body
            await userService.resetPassword(body.hash, body.otp, body.password);
            res.send(successResponse({}))
        } catch(e) {
            next(e)
        }
    }
)

router.put('/',
    verifyClient, 
    validateRequest({
        body: SCHEMA.UPDATE_USER
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.UPDATE_USER> = req.body
        try {
            if (!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const user = await userService.updateUser(req.userID!!, body.email_address, body.full_name, body.national_id, body.photo_url);
            res.send(successResponse({
                full_name: user.full_name,
                email_address: user.email_address,
                phone_number: user.phone_number,
                national_id: user.national_id,
                photo_url: user.photo_url
            }));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/userMetrics',
    verifyClient,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const metrics = await userService.getUserMetrics();
            res.send(successResponse(metrics));
        } catch(e) {
            next(e)
        }
    }
)



export default router;