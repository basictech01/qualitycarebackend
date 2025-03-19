import { verifyAdmin } from "@middleware/auth";
import validateRequest from "@middleware/validaterequest";
import BranchService from "@services/branch";
import { successResponse } from "@utils/reponse";
import { verify } from "crypto";
import { NextFunction, Request, Response, Router } from "express";
import z from 'zod'


const SCHEMA = {
    BRANCH_DETAILS: z.object({
        name_ar: z.string(),
        name_en: z.string(),
        city_en: z.string(),
        city_ar: z.string(),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
    }),
}

var router = Router();
const branchService = new BranchService();

router.get('/',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const branch = await branchService.getBranch();
            res.send(successResponse(branch));
        } catch (e) {
            next(e)
        }
    }
)

router.put('/:id',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.BRANCH_DETAILS
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.BRANCH_DETAILS> = req.body
        try {
            const id = parseInt(req.params.id)
            const branch = await branchService.updateBranch(id, body.name_ar, body.name_en, body.city_en, body.city_ar, body.latitude, body.longitude);
            res.send(successResponse(branch));
        } catch (e) {
            next(e)
        }
    }
)

router.post('/',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.BRANCH_DETAILS
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        const body: z.infer<typeof SCHEMA.BRANCH_DETAILS> = req.body
        try {
            const branch = await branchService.createBranch(body.name_ar, body.name_en, body.city_en, body.city_ar, body.latitude, body.longitude);
            res.send(successResponse(branch));
        } catch (e) {
            next(e)
        }
    }
)

router.delete('/:id',
    verifyAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id)
            const banner = await branchService.deleteBranch(id);
            res.send(successResponse(banner.id));
        } catch (e) {
            next(e)
        }
    }
)



export default router;
