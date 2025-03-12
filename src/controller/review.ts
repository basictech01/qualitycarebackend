import { verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS } from "@utils/error";
import { z } from "zod";
import validateRequest from "@middleware/validaterequest";
import ReviewService from "@services/review";
import { successResponse } from "@utils/reponse";


var router = Router();

const reviewService = new ReviewService();

const SCHEMA = {
    REVIEW_DETAILS: z.object({
        booking_id: z.number().min(1),
        rating: z.number().min(1).max(5),
    }),
    REVIEW_COMMENT: z.object({
        comment: z.string().min(1),
        review_id: z.number().min(1)
    })
}

router.post('/',
    verifyClient,
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.REVIEW_DETAILS> = req.body;
        try {
            if (!req.userID) {
                res.send(ERRORS.AUTH_UNAUTHERISED);
            }
            const review = await reviewService.createReview(req.userID!!, body.booking_id, body.rating);
            res.send(successResponse(review));
        } catch (e) {
            next(e)
        }
    }
)

router.post('/comment',
    verifyClient,
    validateRequest({
        body: SCHEMA.REVIEW_COMMENT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.REVIEW_COMMENT> = req.body;
        try {
            if (!req.userID) {
                res.send(ERRORS.AUTH_UNAUTHERISED);
            }
            const comment = await reviewService.createComment(body.review_id, body.comment);
            res.send(successResponse(comment));
        } catch (e) {
            next(e)
        }
    }
)


export default router;
