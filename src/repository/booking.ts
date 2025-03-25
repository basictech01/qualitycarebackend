import { ERRORS, RequestError } from "@utils/error";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import createLogger from "@utils/logger";
import { BookingDoctor, BookingDoctorDetails, BookingDoctorView, BookingServiceDetails, BookingServiceI, BookingServiceView, TotalVisitsPerUser } from "@models/booking";
import BookingService from "@services/booking";


const logger = createLogger('@bookingRepository')
interface BookingDoctorRow extends RowDataPacket, BookingDoctor {
}

interface BookingServiceIRow extends RowDataPacket, BookingServiceI {
}

interface BookingDoctorViewRow extends RowDataPacket, BookingDoctorView {
}

interface BookingServiceViewRow extends RowDataPacket, BookingServiceView {
}

interface BookingServiceDetailsRow extends RowDataPacket, BookingServiceDetails {}

interface BookingDoctorDetailsRow extends RowDataPacket, BookingDoctorDetails {}

interface VisitsPerUserRow extends RowDataPacket, TotalVisitsPerUser {}
export default class BookingRepository {

    async bookDoctor(connection: PoolConnection, doctor_id: number, time_slot_id: number, user_id: number, date: string, branch_id: number, vat: string): Promise<BookingDoctor> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO booking_doctor (doctor_id, time_slot_id, user_id, date, branch_id, vat) VALUES (?, ?, ?, ?, ?, ?)', [doctor_id, time_slot_id, user_id, date, branch_id, vat]);
            const booking_id = result.insertId;
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getDoctorBooking(connection: PoolConnection, doctor_id: number, date: string): Promise<BookingDoctor[]> {
        try {
            const [result,] = await connection.query<BookingDoctorRow[]>('SELECT * FROM booking_doctor WHERE doctor_id = ? AND date = ?', [doctor_id, date]);
            return result;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getDoctorBookingOrNull(connection: PoolConnection, doctor_id: number, date: string, time_slot_id: number, branch_id: number): Promise<BookingDoctor | null> {
        try {
            const [result,] = await connection.query<BookingDoctorRow[]>('SELECT * FROM booking_doctor WHERE doctor_id = ? AND date = ? AND time_slot_id = ? AND branch_id = ?', [doctor_id, date, time_slot_id, branch_id]);
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
            await connection.query('UPDATE booking_doctor set status = "CANCELED" where id = ?', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async rescheduleDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            await connection.query('UPDATE booking_doctor set status = "RESCHEDULE" where id = ?', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async rescheduleService(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            await connection.query('UPDATE booking_service set status = "RESCHEDULE" where id = ?', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async completeDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            await connection.query('UPDATE booking_doctor set status = "COMPLETED" where id = ?', [booking_id]);
            return await this.getBookingDoctor(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getBookingDoctor(connection: PoolConnection, booking_id: number): Promise<BookingDoctor> {
        try {
            const [result,] = await connection.query<BookingDoctorRow[]>('SELECT * FROM booking_doctor WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getVisitCountByUser(connection: PoolConnection, user_id: number): Promise<number> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT COUNT(*) as count FROM booking_service WHERE user_id = ?', [user_id]);
            return result[0].count;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getBookingDoctorOrNull(connection: PoolConnection, booking_id: number): Promise<BookingDoctor | null> {
        try {
            const [result,] = await connection.query<BookingDoctorRow[]>('SELECT * FROM booking_doctor WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async bookService(connection: PoolConnection, service_id: number, time_slot_id: number, user_id: number, date: string, branch_id: number, vat: string): Promise<BookingServiceIRow> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO booking_service (service_id, time_slot_id, user_id, date, branch_id, vat) VALUES (?, ?, ?, ?, ?, ?)', [service_id, time_slot_id, user_id, date, branch_id, vat]);
            const booking_id = result.insertId;
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceBookingOrNull(connection: PoolConnection, service_id: number, date: string, time_slot_id: number, branch_id: number): Promise<BookingServiceIRow | null> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT * FROM booking_service WHERE service_id = ? AND date = ? AND time_slot_id = ? AND branch_id = ?', [service_id, date, time_slot_id, branch_id]);
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceBookingByIdOrNull(connection: PoolConnection, booking_id: number): Promise<BookingServiceIRow | null> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT * FROM booking_service WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllServiceBookingForSlot(connection: PoolConnection, service_id: number, date: string, time_slot_id: number, branch_id: number): Promise<BookingServiceIRow[]> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT * FROM booking_service WHERE service_id = ? AND date = ? AND time_slot_id = ? AND branch_id = ?', [service_id, date, time_slot_id, branch_id]);
            return result;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllServiceBookingForBranch(connection: PoolConnection, service_id: number, branch_id: number, date: string): Promise<BookingServiceIRow[]> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT * FROM booking_service WHERE service_id = ? AND date = ? AND branch_id = ?', [service_id, date, branch_id]);
            return result;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getBookingService(connection: PoolConnection, booking_id: number): Promise<BookingServiceIRow> {
        try {
            const [result,] = await connection.query<BookingServiceIRow[]>('SELECT * FROM booking_service WHERE id = ?', [booking_id]);
            if (result.length === 0) {
                throw ERRORS.BOOKING_NOT_FOUND
            }
            return result[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async cancelService(connection: PoolConnection, booking_id: number): Promise<BookingServiceIRow> {
        try {
            await connection.query('UPDATE booking_service set status = "CANCELED" where id = ?', [booking_id]);
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async completeService(connection: PoolConnection, booking_id: number): Promise<BookingServiceIRow> {
        try {
            await connection.query('UPDATE booking_service set status = "COMPLETED" where id = ?', [booking_id]);
            return await this.getBookingService(connection, booking_id);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getTotalSpendByUserOnDoctor(connection: PoolConnection, user_id: number): Promise<number> {
        try {
            const [result,] = await connection.query<TotalSpend[]>('SELECT SUM(d.session_fees) as total FROM booking_doctor bd JOIN doctor d ON bd.doctor_id = d.id WHERE bd.user_id = ?', [user_id]);
            return parseFloat(result[0].total);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getTotalSpendByUserOnService(connection: PoolConnection, user_id: number): Promise<number> {
        try {
            const [result,] = await connection.query<TotalSpend[]>('SELECT SUM(s.discounted_price) as total FROM booking_service bs JOIN service s ON bs.service_id = s.id WHERE bs.user_id = ?', [user_id]);
            return parseFloat(result[0].total);
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllDoctorBooking(connection: PoolConnection, doctor_id: number, date: string): Promise<BookingDoctor[]> {
        try {
            const [result,] = await connection.query<BookingDoctorRow[]>('SELECT * FROM booking_doctor WHERE doctor_id = ? AND date = ?', [doctor_id, date]);
            return result;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllDoctorBookingForUser(connection: PoolConnection, user_id: number): Promise<BookingDoctorView[]> {
        
        try {
            const [result,] = await connection.query<BookingDoctorViewRow[]>(`SELECT 
                                                                bd.id,
                                                                bd.user_id,
                                                                bd.status,
                                                                bd.vat_percentage,
                                                                dts.start_time,
                                                                dts.end_time,
                                                                b.name_en AS branch_name_en,
                                                                b.name_ar AS branch_name_ar,
                                                                d.name_en,
                                                                d.name_ar,
                                                                d.photo_url,
                                                                bd.date
                                                            FROM booking_doctor bd
                                                            JOIN doctor d ON bd.doctor_id = d.id
                                                            JOIN doctor_branch db ON d.id = db.doctor_id
                                                            JOIN branch b ON db.branch_id = b.id
                                                            JOIN doctor_time_slot dts ON dts.doctor_id = bd.doctor_id
                                                            WHERE bd.time_slot_id = dts.id and user_id = ?`, [user_id]);
            return result
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllServiceBookingForUser(connection: PoolConnection, user_id: number): Promise<BookingServiceView[]> {
        try {
            const [result,] = await connection.query<BookingServiceViewRow[]>(`SELECT 
                    bs.id,
                    bs.user_id,
                    bs.status,
                    bs.vat_percentage,
                    b.name_en AS branch_name_en,
                    b.name_ar AS branch_name_ar,
                    sts.start_time,
                    sts.end_time,
                    s.name_ar,
                    s.name_en,
                    sc.name_en AS category_name_en,
                    sc.name_ar AS category_name_ar,
                    s.service_image_en_url,
                    s.service_image_ar_url,
                    bs.date
                FROM booking_service bs
                JOIN branch b ON bs.branch_id = b.id
                JOIN service s ON bs.service_id = s.id
                JOIN service_category sc ON s.category_id = sc.id
                JOIN service_time_slot sts ON bs.time_slot_id = sts.id
                WHERE bs.user_id = ?`, [user_id]);
            return result;
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllServiceBookingsMetrics(connection: PoolConnection): Promise<BookingServiceDetailsRow[]> {
        try {
            const [result,] = await connection.query<BookingServiceDetailsRow[]>(`SELECT
                    bs.id AS id,
                    bs.user_id AS user_id,
                    u.full_name AS user_full_name,
                    u.email_address AS user_email,
                    bs.branch_id AS branch_id,
                    b.name_en AS branch_name_en,
                    b.name_ar AS branch_name_ar,
                    bs.service_id AS service_id,
                    s.actual_price AS service_actual_price,
                    bs.vat_percentage AS vat_percentage,
                    s.discounted_price AS service_discounted_price,
                    s.name_en AS service_name_en,
                    s.name_ar AS service_name_ar,
                    s.category_id AS service_category_id,
                    sc.type AS service_category_type,
                    sc.name_en AS service_category_name_en,
                    sc.name_ar AS service_category_name_ar,
                    bs.time_slot_id AS time_slot_id,
                    ts.start_time AS time_slot_start_time,
                    ts.end_time AS time_slot_end_time,
                    bs.date AS booking_date,
                    bs.status AS booking_status
                FROM
                    booking_service bs
                LEFT JOIN
                    user u ON bs.user_id = u.id
                LEFT JOIN
                    branch b ON bs.branch_id = b.id
                LEFT JOIN
                    service s ON bs.service_id = s.id
                LEFT JOIN
                    service_category sc ON s.category_id = sc.id
                LEFT JOIN
                    service_time_slot ts ON bs.time_slot_id = ts.id;`);
            return result;
        }
        catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllDoctorBookingsMetrics(connection: PoolConnection): Promise<BookingDoctorDetailsRow[]> {
        try {
            const [result,] = await connection.query<BookingDoctorDetailsRow[]>(`SELECT
                        bd.id AS id,
                        bd.user_id AS user_id,
                        u.full_name AS user_full_name,
                        u.email_address AS user_email,
                        bd.status AS booking_status,
                        bd.doctor_id AS doctor_id,
                        d.name_en AS doctor_name_en,
                        d.name_ar AS doctor_name_ar,
                        bd.vat_percentage AS vat_percentage,
                        d.photo_url AS doctor_photo_url,
                        d.session_fees AS doctor_session_fees,
                        bd.time_slot_id AS time_slot_id,
                        dts.start_time AS time_slot_start_time,
                        dts.end_time AS time_slot_end_time,
                        bd.branch_id AS branch_id,
                        b.name_en AS branch_name_en,
                        b.name_ar AS branch_name_ar,
                        bd.date AS booking_date
                    FROM
                        booking_doctor bd
                    LEFT JOIN
                        user u ON bd.user_id = u.id
                    LEFT JOIN
                        doctor d ON bd.doctor_id = d.id
                    LEFT JOIN
                        branch b ON bd.branch_id = b.id
                    LEFT JOIN
                        doctor_time_slot dts ON bd.time_slot_id = dts.id;`);
            return result;
        }
        catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }


    async getTotalServiceVisitsPerUser(connection: PoolConnection): Promise<TotalVisitsPerUser[]> {
        try {
            const [result,] = await connection.query<VisitsPerUserRow[]>('SELECT user_id, count(*) as visits from booking_service group by user_id');
            return result
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }


    async getTotalDoctorVisitsPerUser(connection: PoolConnection): Promise<TotalVisitsPerUser[]> {
        try {
            const [result,] = await connection.query<VisitsPerUserRow[]>('SELECT user_id, count(*) as visits from booking_doctor group by user_id');
            return result
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}

interface TotalSpend extends RowDataPacket {
    total: string;
}
