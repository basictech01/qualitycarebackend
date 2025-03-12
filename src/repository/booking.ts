import { ERRORS, RequestError } from "@utils/error";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import createLogger from "@utils/logger";
import { BookingDoctor, BookingServiceI } from "@models/booking";
import BookingService from "@services/booking";


const logger = createLogger('@bookingRepository')

export default class BookingRepository {
    
    async bookDoctor(connection: PoolConnection, doctor_id: number, time_slot_id: number, user_id: number, date: Date): Promise<BookingDoctor> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO booking_doctor (doctor_id, time_slot_id, user_id, date) VALUES (?, ?, ?, ?)', [doctor_id, time_slot_id, user_id, date]);
            const booking_id = result.insertId;
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getDoctorBookingOrNull(connection: PoolConnection, doctor_id: number, date: Date, time_slot_id: number): Promise<BookingDoctor | null> {
        try {
            const [result,] = await connection.query<BookingDoctor[]>('SELECT * FROM booking_doctor WHERE doctor_id = ? AND date = ? AND time_slot_id = ?', [doctor_id, date, time_slot_id]);
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async cancelDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            await connection.query('UPDATE booking_doctor set status = "CANCELED"', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async completeDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            await connection.query('UPDATE booking_doctor set status = "COMPLETE"', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getBookingDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            const [result,] = await connection.query<BookingDoctor[]>('SELECT * FROM booking_doctor WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async bookService(connection: PoolConnection, service_id: number, time_slot_id: number, user_id: number, date: Date): Promise<BookingServiceI> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO booking_service (service_id, time_slot_id, user_id, date) VALUES (?, ?, ?, ?)', [service_id, time_slot_id, user_id, date]);
            const booking_id = result.insertId;
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceBookingOrNull(connection: PoolConnection, service_id: number, date: Date, time_slot_id: number): Promise<BookingServiceI | null> {
        try {
            const [result,] = await connection.query<BookingServiceI[]>('SELECT * FROM booking_service WHERE service_id = ? AND date = ? AND time_slot_id = ?', [service_id, date, time_slot_id]);
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getBookingService(connection: PoolConnection, booking_id: number): Promise<BookingServiceI> {
        try {
            const [result,] = await connection.query<BookingServiceI[]>('SELECT * FROM booking_service WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async cancelService(connection: PoolConnection, booking_id: number): Promise<BookingServiceI> {
        try {
            await connection.query('UPDATE booking_service set status = "CANCELED"', [booking_id]);
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async completeService(connection: PoolConnection, booking_id: number): Promise<BookingServiceI> {
        try {
            await connection.query('UPDATE booking_service set status = "COMPLETE"', [booking_id]);
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getTotalSpendByUserOnDoctor(connection: PoolConnection, user_id: number): Promise<number> {
        try {
            const [result,] = await connection.query<any[]>('SELECT SUM(d.session_fees) as total FROM booking_doctor bd JOIN doctor d ON bd.doctor_id = d.id WHERE bd.user_id = ?', [user_id]);
            return result[0].total;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getTotalSpendByUserOnService(connection: PoolConnection, user_id: number): Promise<number> {
        try {
            const [result,] = await connection.query<any[]>('SELECT SUM(s.price) as total FROM booking_service bs JOIN service s ON bs.service_id = s.id WHERE bs.user_id = ?', [user_id]);
            return result[0].total;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

}