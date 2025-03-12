import { BookingDoctor, BookingServiceI } from "@models/booking";
import BookingRepository from "@repository/booking";
import UserRepository from "@repository/user";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@bookingService');

export default class BookingService {
    bookingRepository: BookingRepository;
    userRepository: UserRepository;

    constructor() {
        this.bookingRepository = new BookingRepository();
        this.userRepository = new UserRepository();
    }

    async bookDoctor(doctor_id: number, time_slot_id: number, user_id: number, date: Date): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const existingBooking = await this.bookingRepository.getDoctorBookingOrNull(connection, doctor_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const booking = await this.bookingRepository.bookDoctor(connection, doctor_id, time_slot_id, user_id, date);
            await connection.commit();
            return booking;
        } catch(e) {
            logger.error(e);
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
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingDoctor(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.cancelDoctor(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
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
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingDoctor(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = this.bookingRepository.completeDoctor(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async rescheduleDoctor(booking_id: number, time_slot_id: number, user_id: number, date: Date, is_admin: boolean): Promise<BookingDoctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingDoctor(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const booking = await this.bookingRepository.getBookingDoctor(connection, booking_id);
            const existingBooking = await this.bookingRepository.getDoctorBookingOrNull(connection, booking.doctor_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const newBooking = await this.bookingRepository.bookDoctor(connection, booking.doctor_id, time_slot_id, user_id, date);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async bookService(service_id: number, time_slot_id: number, user_id: number, date: Date): Promise<BookingServiceI> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            const existingBooking = await this.bookingRepository.getServiceBookingOrNull(connection, service_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const booking = await this.bookingRepository.bookService(connection, service_id, time_slot_id, user_id, date);
            await connection.commit();
            return booking;
        } catch(e) {
            logger.error(e);
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
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingService(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.cancelService(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
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
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingService(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const newBooking = await this.bookingRepository.completeService(connection, booking_id);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }
    }

    async rescheduleService(booking_id: number, time_slot_id: number, user_id: number, date: Date, is_admin: boolean): Promise<any> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            if(!is_admin) {
                const booking = await this.bookingRepository.getBookingService(connection, booking_id);
                if(booking.user_id !== user_id) {
                    throw ERRORS.BOOKING_NOT_FOUND;
                }
            }
            const booking = await this.bookingRepository.getBookingService(connection, booking_id);
            const existingBooking = await this.bookingRepository.getServiceBookingOrNull(connection, booking.service_id, date, time_slot_id);
            if(existingBooking) {
                throw ERRORS.DOCTOR_ALREADY_BOOKED_FOR_THIS_SLOT;
            }
            const newBooking = await this.bookingRepository.bookDoctor(connection, booking.service_id, time_slot_id, user_id, date);
            await connection.commit();
            return newBooking;
        } catch(e) {
            logger.error(e);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if(connection) {
                connection.release();
            }
        }

        
    }
}
