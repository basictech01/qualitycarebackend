import { verifyAdmin, verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS } from "@utils/error";
import { date, z } from "zod";
import validateRequest from "@middleware/validaterequest";


import DoctorService from '@services/doctor';

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
    }),
    ADD_DOCTOR_TO_BRANCH: z.object({
        doctor_id: z.number(),
        branch_id: z.number()
    }),
    CREATE_DOCTOR_TIME_SLOT: z.object({
        doctor_id: z.number(),
        day: z.number().min(1).max(7),
        start_time: z.string().datetime(),
        end_time: z.string().datetime()
    }),
    GET_TIME_SLOT: z.object({
        doctor_id: z.number(),
        branch_id: z.number(),
        day: z.number().min(1).max(7)
    })
}


// GET all doctors
router.get('/',
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctors = await doctorService.getAllDoctors();
            res.json(doctors);
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
            const body: z.infer<typeof SCHEMA.CREATE_DOCTOR> = req.body
            const doctor = await doctorService.createDoctor(body.about_ar, body.about_en, body.attended_patient, body.languages, body.name_ar, body.name_en, body.photo_url, body.qualification, body.session_fees, body.total_experience);
            res.json(doctor);
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
            res.json(doctors);
        } catch (e) {
            next(e);
        }
    }
)

// add a doctor to the branch
router.post('/branch',
    verifyAdmin,
    validateRequest({
        body: SCHEMA.ADD_DOCTOR_TO_BRANCH
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body = req.body;
            await doctorService.addDoctorToBranch(body.doctor_id, body.branch_id);
            res.json({message: 'Doctor added to branch'});
        } catch (e) {
            next(e);
        }
    }
)

//
router.post('/time-slot',
    validateRequest({
        body: SCHEMA.CREATE_DOCTOR_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const body: z.infer<typeof SCHEMA.CREATE_DOCTOR_TIME_SLOT> = req.body
            const timeSlots = await doctorService.crateDoctorTimeSlot(body.doctor_id, body.day, body.start_time, body.end_time);
            res.json(timeSlots);
        } catch (e) {
            next(e);
        }
    }
)

router.get('/time-slot',
    validateRequest({
        query: SCHEMA.GET_TIME_SLOT
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const doctor_id = parseInt(req.query.doctor_id as string);
            const branch_id = parseInt(req.query.branch_id as string);
            const day = parseInt(req.query.day as string);

            const timeSlots = await doctorService.getDoctorTimeSlot(doctor_id, branch_id, day);
            res.json(timeSlots);
        } catch (e) {
            next(e);
        }
    }
)

router.get('/time-slot/avaliable',
    // TODO
)


export default router;