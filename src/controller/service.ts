import { verifyAdmin, verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS } from "@utils/error";
import { z } from "zod";
import validateRequest from "@middleware/validaterequest";
import ServiceService from '@services/service';

var router = Router();

const serviceService = new ServiceService();

const SCHEMA = {
    CREATE_SERVICE: z.object({
        name_en: z.string(),
        name_ar: z.string(),
        category_id: z.number(),
        about_en: z.string(),
        about_ar: z.string(),
        actual_price: z.number(),
        discounted_price: z.number(),
        maximum_booking_per_slot: z.number(),
        service_image_en_url: z.string(),
        service_image_ar_url: z.string(),
        can_redeem: z.boolean().default(false)
    }),
    UPDATE_SERVICE: z.object({
        name_en: z.string().optional(),
        name_ar: z.string().optional(),
        category_id: z.number().optional(),
        about_en: z.string().optional(),
        about_ar: z.string().optional(),
        actual_price: z.number().optional(),
        discounted_price: z.number().optional(),
        maximum_booking_per_slot: z.number().optional(),
        service_image_en_url: z.string().optional(),
        service_image_ar_url: z.string().optional(),
        can_redeem: z.boolean().optional()
    }),
    CREATE_SERVICE_CATEGORY: z.object({
        name_en: z.string(),
        name_ar: z.string(),
        type: z.enum(['DENTIST', 'DERMATOLOGIST'])
    }),
    CREATE_TIME_SLOT: z.object({
        service_id: z.number(),
        start_time: z.string().datetime(),
        end_time: z.string().datetime()
    }),
    ADD_SERVICE_TO_BRANCH: z.object({
        service_id: z.number(),
        branch_id: z.number()
    })
        
}

var router = Router();

router.get('/',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const services = await serviceService.getAll();
            res.json(services);
        } catch (error) {
            next(error);
        }
    }
)

router.post('/',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_SERVICE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_SERVICE> = req.body;
            const service = await serviceService.create(body.name_en, body.name_ar, body.category_id, body.about_en, body.about_ar, body.actual_price, body.discounted_price, body.maximum_booking_per_slot, body.service_image_en_url, body.service_image_ar_url, body.can_redeem);
            res.json(service);
        } catch (error) {
            next(error);
        }
    }
)

router.put('/:service_id',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.UPDATE_SERVICE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.UPDATE_SERVICE> = req.body;
            const service_id = parseInt(req.params.service_id);
            const service = await serviceService.update(service_id, body.name_en, body.name_ar, body.category_id, body.about_en, body.about_ar, body.actual_price, body.discounted_price, body.maximum_booking_per_slot, body.service_image_en_url, body.service_image_ar_url, body.can_redeem);
            res.json(service);
        } catch (error) {
            next(error);
        }
    }
)

// Get all services for a category
router.get('/service/category',
    validateRequest({
        query: z.object({
            category_id: z.number()
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const category_id = parseInt(req.query.category_id as string);
            const services = await serviceService.getAllByCategory(category_id);
            res.json(services);
        } catch (error) {
            next(error);
        }
    }
)

router.post('/category',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_SERVICE_CATEGORY
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_SERVICE_CATEGORY> = req.body;
            const category = await serviceService.createCategory(body.name_en, body.name_ar, body.type);
            res.json(category);
        } catch (error) {
            next(error);
        }
    }
)

router.get('/time_slots',
    validateRequest({
        query: z.object({
            service_id: z.number(),
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const service_id = parseInt(req.query.service_id as string);
            const date_string = req.query.date as string;
            const date = new Date(date_string);
            const timeSlots = await serviceService.getTimeSlots(service_id);
            res.json(timeSlots);
        } catch (error) {
            next(error);
        }
    }
)

router.get('/time_slots/available',
    verifyClient,
    validateRequest({
        query: z.object({
            service_id: z.number(),
            date: z.string()
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const service_id = parseInt(req.query.service_id as string);
            const date_string = req.query.date as string;
            const date = new Date(date_string);
            const timeSlots = await serviceService.getAvailableTimeSlots(service_id, date);
            res.json(timeSlots);
        } catch (error) {
            next(error);
        }
    }
)

router.post('/time_slots',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_TIME_SLOT> = req.body;
            const start_time = new Date(body.start_time);
            const end_time = new Date(body.end_time);
            const timeSlot = await serviceService.createServiceTimeSlot(body.service_id, start_time, end_time);
            res.json(timeSlot);
        } catch (error) {
            next(error);
        }
    }
)

// Get all services for a branch
router.get('/branch',
    validateRequest({
        query: z.object({
            branch_id: z.number()
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const branch_id = parseInt(req.query.branch_id as string);
            const branches = await serviceService.getServicesForBranch(branch_id);
            res.json(branches);
        } catch (error) {
            next(error);
        }
    }
)

router.post('/branch',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.ADD_SERVICE_TO_BRANCH
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.ADD_SERVICE_TO_BRANCH> = req.body;
            const branch = await serviceService.addServiceToBranch(body.service_id, body.branch_id);
            res.json(branch);
        } catch (error) {
            next(error);
        }
    }
)

// get all services that can be redeemed
router.get('can_redeem',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const service_id = parseInt(req.query.service_id as string);
            const canRedeem = await serviceService.getRedeemableServices();
            res.json(canRedeem);
        } catch (error) {
            next(error);
        }
    }
)

export default router;
