import validateRequest from "@middleware/validaterequest";
import BannerService from "@services/banner";
import { successResponse } from "@utils/reponse";
import { NextFunction, Request, Response, Router } from "express";
import z from 'zod'

const SCHEMA = {
    BANNER_DETAILS: z.object({
        image_en: z.string(),
        image_ar: z.string(),
        link: z.string(),
        start_timestamp: z.string(),
        end_timestamp: z.string(),
    }),
}

var router = Router();
const bannerService = new BannerService();


router.get('/',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const banner = await bannerService.getBanners();
            res.send(successResponse({ banner }));
        } catch (e) {
            next(e)
        }
    }
)

router.post('/',
    validateRequest({
        body: SCHEMA.BANNER_DETAILS
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.BANNER_DETAILS> = req.body
        try {
            const banner = await bannerService.createBanner(body.image_en, body.image_ar, body.link, body.start_timestamp, body.end_timestamp);
            res.send(successResponse({ banner }));
        } catch (e) {
            next(e)
        }
    }
)

export default router;
