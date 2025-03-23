import { verifyAdmin, verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS } from "@utils/error";
import { date, z } from "zod";
import validateRequest from "@middleware/validaterequest";
import BookingService from '@services/booking';
import { successResponse } from "@utils/reponse";

var router = Router();

const bookingService = new BookingService();

const SCHEMA = {
    DOCTOR: z.object({
        doctor_id: z.number(),
        time_slot_id: z.number(),
        branch_id: z.number(),
        date: z.string().date()
    }),
    DOCTOR_CANCEL: z.object({
        booking_id: z.number()
    }),
    DOCTOR_COMPLETE: z.object({
        booking_id: z.number()
    }),
    DOCTOR_RESCHEDULE: z.object({
        booking_id: z.number(),
        time_slot_id: z.number(),
        date: z.string().date()
    }),
    SERVICE: z.object({
        service_id: z.number(),
        time_slot_id: z.number(),
        branch_id: z.number(),
        date: z.string().date()
    }),
    SERVICE_CANCEL: z.object({
        booking_id: z.number()
    }),
    SERVICE_COMPLETE: z.object({
        booking_id: z.number()
    }),
    SERVICE_RESCHEDULE: z.object({
        booking_id: z.number(),
        time_slot_id: z.number(),
        date: z.string().date()
    })
}

router.post('/doctor',
    verifyClient,
    validateRequest({
        body: SCHEMA.DOCTOR
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.DOCTOR> = req.body;
            const booking = await bookingService.bookDoctor(body.doctor_id, body.time_slot_id, req.userID!!, body.date, body.branch_id);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/doctor/cancel',
    verifyClient,
    validateRequest({
        body: SCHEMA.DOCTOR_CANCEL
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.DOCTOR_CANCEL> = req.body;
            const booking = await bookingService.cancelDoctor(body.booking_id, req.userID!!, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/doctor/complete',
    verifyClient,
    validateRequest({
        body: SCHEMA.DOCTOR_COMPLETE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.DOCTOR_COMPLETE> = req.body;
            const booking = await bookingService.completeDoctor(body.booking_id, req.userID!!, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/doctor/reschedule',
    verifyClient,
    validateRequest({
        body: SCHEMA.DOCTOR_RESCHEDULE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.DOCTOR_RESCHEDULE> = req.body;
            const booking = await bookingService.rescheduleDoctor(body.booking_id, body.time_slot_id, req.userID!!, body.date, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/service',
    verifyClient,
    validateRequest({
        body: SCHEMA.SERVICE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.SERVICE> = req.body;
            const booking = await bookingService.bookService(body.service_id, body.time_slot_id, req.userID!!, body.date, body.branch_id);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/service/cancel',
    verifyClient,
    validateRequest({
        body: SCHEMA.SERVICE_CANCEL
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.SERVICE_CANCEL> = req.body;
            const booking = await bookingService.cancelService(body.booking_id, req.userID!!, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.post('/service/complete',
    verifyClient,
    validateRequest({
        body: SCHEMA.SERVICE_COMPLETE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.SERVICE_COMPLETE> = req.body;
            const booking = await bookingService.completeService(body.booking_id, req.userID!!, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)


router.post('/service/reschedule',
    verifyClient,
    validateRequest({
        body: SCHEMA.SERVICE_RESCHEDULE
    }),
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const body: z.infer<typeof SCHEMA.SERVICE_RESCHEDULE> = req.body;
            const booking = await bookingService.rescheduleService(body.booking_id, body.time_slot_id, req.userID!!, body.date, req.isAdmin ?? false);
            res.send(successResponse(booking));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/doctor',
    verifyClient,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const bookings = await bookingService.getAllDoctorBookingsForUser(req.userID!!);
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/service',
    verifyClient,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const bookings = await bookingService.getAllServiceBookingsForUser(req.userID!!);
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/service/metric',
    verifyAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const bookings = await bookingService.getAllServiceBookingsMetric();
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)


router.get('/doctor/metric',
    verifyAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            if(!req.userID) {
                next(ERRORS.AUTH_UNAUTHERISED);
            }
            const bookings = await bookingService.getAllDoctorBookingsMetric();
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/doctor/:id',
    verifyAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = parseInt(req.params.id);
            if(isNaN(userID)) {
                next(ERRORS.INVALID_PARAMS);
            }
            const bookings = await bookingService.getAllDoctorBookingsForUser(userID);
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)

router.get('/service/:id',
    verifyAdmin,
    async function(req: Request, res: Response, next: NextFunction) {
        try {
            const userID = parseInt(req.params.id);
            if(isNaN(userID)) {
                next(ERRORS.INVALID_PARAMS);
            }
            const bookings = await bookingService.getAllServiceBookingsForUser(userID);
            res.send(successResponse(bookings));
        } catch(e) {
            next(e)
        }
    }
)

export default router;