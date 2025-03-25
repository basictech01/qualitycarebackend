import { verifyAdmin, verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { z } from "zod";
import validateRequest from "@middleware/validaterequest";


import DoctorService from '@services/doctor';
import { successResponse } from "@utils/reponse";
import { start } from "repl";

const doctorService = new DoctorService();
var router = Router();

const SCHEMA = {
    CREATE_DOCTOR: z.object({
        session_fees: z.number(),
        attended_patient: z.number(),
        total_experience: z.number(),
        about_en: z.string(),
        about_ar: z.string(),
        qualification: z.string(),
        languages: z.string(),
        name_en: z.string(),
        name_ar: z.string(),
        photo_url: z.string(),
        is_active: z.boolean().optional()
    }),
    UPDATE_DOCTOR: z.object({
        session_fees: z.number().optional(),
        attended_patient: z.number().optional(),
        total_experience: z.number().optional(),
        about_en: z.string().optional(),
        about_ar: z.string().optional(),
        qualification: z.string().optional(),
        languages: z.string().optional(),
        name_en: z.string().optional(),
        name_ar: z.string().optional(),
        photo_url: z.string().optional(),
        is_active: z.boolean().optional()
    }),
    ADD_DOCTOR_TO_BRANCHES: z.object({
        doctor_id: z.number(),
        branches: z.array(z.object({
            day_map: z.string().min(7).max(7),
            branch_id: z.number()
        }))
    }),
    UPDATE_DOCTOR_TO_BRANCH: z.object({
        branches: z.array(z.object({
            day_map: z.string().min(7).max(7),
            branch_id: z.number()
        }))
    }),
    CREATE_DOCTOR_TIME_SLOT: z.object({
        doctor_id: z.number(),
        start_time: z.string().time(),
        end_time: z.string().time()
    }),
    CREATE_DOCTOR_TIME_SLOTS: z.object({
        doctor_id: z.number(),
        time_slots: z.array(z.object({
            start_time: z.string().time(),
            end_time: z.string().time()
        }))
    }),
    UPDATE_DOCTOR_TIME_SLOT: z.object({
        time_slots: z.array(z.object({
            start_time: z.string().time(),
            end_time: z.string().time()
        }))
    }),
    GET_TIME_SLOT: z.object({
        doctor_id: z.string(),
    }),
    GET_ALL_TIME_SLOT: z.object({
        doctor_id: z.string(),
    })
}


// GET all doctors
router.get('/',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctors = await doctorService.getAllDoctors();
            res.json(successResponse(doctors));
        } catch (e) {
            next(e);
        }
    }
)

router.post('/',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_DOCTOR
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_DOCTOR> = req.body;
            if (body.is_active === undefined) {
                body.is_active = true;
            }
            const doctor = await doctorService.createDoctor(body.about_ar, body.about_en, body.attended_patient, body.languages, body.name_ar, body.name_en, body.photo_url, body.qualification, body.session_fees, body.total_experience, body.is_active);
            res.json(successResponse(doctor));
        } catch (e) {
            next(e);
        }
    }
)

// Get doctor for a city, note city has to be in english
router.get('/city',
    validateRequest({
        query: z.object({
           city: z.string().min(1)
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const city = req.query.city as string;
            const doctors = await doctorService.getDoctorForACity(city);
            res.json(successResponse(doctors));
        } catch (e) {
            next(e);
        }
    }
)

// add a doctor to the branch
router.post('/branches',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.ADD_DOCTOR_TO_BRANCHES
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.ADD_DOCTOR_TO_BRANCHES> = req.body
            const doctorBranch = await doctorService.addDoctorToBranch(body.doctor_id, body.branches);
            res.json(successResponse(doctorBranch));
        } catch (e) {
            next(e);
        }
    }
)

router.put('/branches/:id',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.UPDATE_DOCTOR_TO_BRANCH
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.UPDATE_DOCTOR_TO_BRANCH> = req.body
            const doctor_id = parseInt(req.params.id);
            const doctorBranch = await doctorService.updateDoctorBranch(doctor_id, body.branches);
            res.json(successResponse(doctorBranch));
        } catch (e) {
            next(e);
        }
    }
)

router.get('/branches',
    verifyAdmin,
    validateRequest({
        query: z.object({
            doctor_id: z.string()
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.query.doctor_id as string);
            const doctorBranch = await doctorService.getDoctorBranches(doctor_id);
            res.json(successResponse(doctorBranch));
        } catch (e) {
            next(e);
        }
    }
)

//
router.post('/time-slot',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_DOCTOR_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_DOCTOR_TIME_SLOT> = req.body
            const timeSlots = await doctorService.crateDoctorTimeSlot(body.doctor_id, body.start_time, body.end_time);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.post('/time-slots',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.CREATE_DOCTOR_TIME_SLOTS
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_DOCTOR_TIME_SLOTS> = req.body
            const timeSlots = await doctorService.crateDoctorTimeSlots(body.doctor_id, body.time_slots);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.put('/time-slots/:id',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.UPDATE_DOCTOR_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.UPDATE_DOCTOR_TIME_SLOT> = req.body
            const doctor_id = parseInt(req.params.id);
            const timeSlots = await doctorService.updateDoctorTimeSlots(doctor_id, body.time_slots);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.get('/time-slots',
    validateRequest({
        query: SCHEMA.GET_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.query.doctor_id as string);
            const timeSlots = await doctorService.getDoctorTimeSlot(doctor_id);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.get('/all/time-slot',
    validateRequest({
        query: SCHEMA.GET_ALL_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.query.doctor_id as string);
            const timeSlots = await doctorService.getAllDoctorTimeSlot(doctor_id);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.get('/time-slot/available',
    validateRequest({
        query: z.object({
            doctor_id: z.string(),
            branch_id: z.string(),
            date: z.string().date()
        })
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.query.doctor_id as string);
            const branch_id = parseInt(req.query.branch_id as string);
            const date = req.query.date as string;
            const day = new Date(date).getDay();
            const timeSlots = await doctorService.getAvailableTimeSlots(doctor_id, branch_id, day, date);
            res.json(successResponse(timeSlots));
        } catch (e) {
            next(e);
        }
    }
)

router.get('/featured',
    async function (req: Request, res: Response, next: NextFunction) {
        try {
            const doctors = await doctorService.getFeaturedDoctors();
            res.json(successResponse(doctors));
        } catch (e) {
            next(e)
    }
})


router.get('/:id',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.params.id);
            const doctors = await doctorService.getDoctorsFromID(doctor_id);
            res.json(successResponse(doctors));
        } catch (e) {
            next(e);
        }
    }
)

router.put('/:id',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.UPDATE_DOCTOR
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.UPDATE_DOCTOR> = req.body
            const doctor_id = parseInt(req.params.id);
            const doctor = await doctorService.updateDoctor(doctor_id, body.about_ar, body.about_en, body.attended_patient, body.languages, body.name_ar, body.name_en, body.photo_url, body.qualification, body.session_fees, body.total_experience, body.is_active);
            res.json(successResponse(doctor));
        } catch (e) {
            next(e);
        }
    }
)

export default router;