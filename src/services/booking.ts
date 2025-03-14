import { BookingDoctor, BookingServiceI } from "@models/booking";
import BookingRepository from "@repository/booking";
import DoctorRepository from "@repository/doctor";
import ServiceRepository from "@repository/service";
import UserRepository from "@repository/user";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@bookingService');

export default class BookingService {
    bookingRepository: BookingRepository;
    userRepository: UserRepository;
    serviceRepository: ServiceRepository;
    doctorRepository: DoctorRepository;

    constructor() {
        this.bookingRepository = new BookingRepository();
        this.userRepository = new UserRepository();
        this.serviceRepository = new ServiceRepository();
        this.doctorRepository = new DoctorRepository();
    }

    async bookDoctor(doctor_id: number, time_slot_id: number, user_id: number, date: string): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if(!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            // check if the timeslot exists or not
            const timeSlot = await this.doctorRepository.getDoctorTimeSlotByIdOrNull(connection, time_slot_id);
            if(!timeSlot) {
                throw ERRORS.TIME_SLOT_NOT_FOUND_FOR_DOCTOR;
            }
            const existingBooking = await this.bookingRepository.getDoctorBookingOrNull(connection, doctor_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const booking = await this.bookingRepository.bookDoctor(connection, doctor_id, time_slot_id, user_id, date);
            await connection.commit();
            return booking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async cancelDoctor(booking_id: number, user_id: number, is_admin: boolean): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getBookingDoctorOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.cancelDoctor(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }

    }

    async completeDoctor(booking_id: number, user_id: number, is_admin: boolean): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getBookingDoctorOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.completeDoctor(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async rescheduleDoctor(booking_id: number, time_slot_id: number, user_id: number, date: string, is_admin: boolean): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getBookingDoctorOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const timeSlot = await this.doctorRepository.getDoctorTimeSlotByIdOrNull(connection, time_slot_id);
            if(!timeSlot) {
                throw ERRORS.TIME_SLOT_NOT_FOUND_FOR_DOCTOR;
            }
            const existingBooking = await this.bookingRepository.getDoctorBookingOrNull(connection, booking.doctor_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const newBooking = await this.bookingRepository.bookDoctor(connection, booking.doctor_id, time_slot_id, user_id, date);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async bookService(service_id: number, time_slot_id: number, user_id: number, date: string, branch_id: number): Promise<BookingServiceI> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const maximumBooking = await this.serviceRepository.getMaximumBooking(connection, service_id, branch_id);
            const existingBooking = await this.bookingRepository.getAllServiceBookingForSlot(connection, service_id, date, time_slot_id, branch_id);
            if(existingBooking.length >= maximumBooking.maximum_booking_per_slot) {
                throw ERRORS.ALL_SLOTS_ALREADY_BOOKED_FOR_THIS_SERVICE;
            }
            const booking = await this.bookingRepository.bookService(connection, service_id, time_slot_id, user_id, date, branch_id);
            await connection.commit();
            return booking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async cancelService(booking_id: number, user_id: number, is_admin: boolean): Promise<BookingServiceI> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getServiceBookingByIdOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.cancelService(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async completeService(booking_id: number, user_id: number, is_admin: boolean): Promise<any> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getServiceBookingByIdOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.completeService(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async rescheduleService(booking_id: number, time_slot_id: number, user_id: number, date: string, is_admin: boolean): Promise<any> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            await connection.beginTransaction();
            const booking = await this.bookingRepository.getServiceBookingByIdOrNull(connection, booking_id);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            if(!is_admin) {
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const existingBooking = await this.bookingRepository.getServiceBookingOrNull(connection, booking.service_id, date, time_slot_id, booking_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const newBooking = await this.bookingRepository.bookDoctor(connection, booking.service_id, time_slot_id, user_id, date);
            await connection.commit();
            return newBooking;
        } catch(e) {
            if(e instanceof RequestError) {
                throw e;
            }
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }
}
