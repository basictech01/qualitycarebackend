import { verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS } from "@utils/error";
import RedeemService from '@services/redeem';
import { z } from "zod";
import validateRequest from "@middleware/validaterequest";


var router = Router();


const redeemService = new RedeemService();

const SCHEMA = {
    REDEEM: z.object({
        booking_id: z.number(),
        service_id: z.number()
    })
}

router.post('/',
    verifyClient,
    validateRequest({
        body: SCHEMA.REDEEM
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                res.send(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.REDEEM> = req.body;
            const redeem = await redeemService.redeem(req.userID!!, body.booking_id, body.service_id);
            res.send(redeem);
        } catch(e) {
            next(e)
        }
    }
)

router.get('/qpoints',
    verifyClient,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                res.send(ERRORS.AUTH_UNAUTHERISED);
            }
            const redeem = await redeemService.getQPoints(req.userID!!);
            res.send(redeem);
        } catch(e) {
            next(e)
        }
    }
)
export default router;