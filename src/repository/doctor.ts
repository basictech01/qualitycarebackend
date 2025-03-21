import { Doctor, DoctorBranch, DoctorTimeSlot } from "@models/doctor";
import { DefaultSetting, Setting, SettingView } from "@models/setting";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@doctorRepository')

export default class DoctorRepository {

    async getAllDoctors(conn: PoolConnection): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM doctor');
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorByIds(conn: PoolConnection, doctorIds: number[]): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM doctor WHERE id IN (?)', [doctorIds]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorById(conn: PoolConnection, doctorId: number): Promise<Doctor> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM doctor WHERE id = ?', [doctorId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            return rows[0] as Doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorByIdOrNull(conn: PoolConnection, doctorId: number): Promise<Doctor | null> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM doctor WHERE id = ?', [doctorId]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0] as Doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctor(conn: PoolConnection, about_ar: string, about_en: string, attended_patient: number, languages: string, name_ar: string, name_en: string, photo_url: string, qualification: string, session_fees: number, total_experience: number): Promise<Doctor> {
        try {
            const [result] = await conn.query<ResultSetHeader>('INSERT INTO doctor (about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience]);
            const doctor = await this.getDoctorById(conn, result.insertId);
            return doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorForBranches(conn: PoolConnection, branchIds: number[]): Promise<DoctorBranch[]> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM doctor_branch WHERE branch_id IN (?)', [branchIds]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async addDoctorToBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<ResultSetHeader>('INSERT INTO doctor_branch (doctor_id, branch_id) VALUES (?, ?)', [doctorId, branchId]);
            const doctorBranch = await this.getDoctorBranchById(conn, rows.insertId);
            return doctorBranch;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranchById(conn: PoolConnection, doctorBranchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM doctor_branch WHERE id = ?', [doctorBranchId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_BRANCH_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctorTimeSlot(conn: PoolConnection, doctor_branch_id: number, day: number, end_time: string, start_time: string): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<ResultSetHeader>('INSERT INTO doctor_time_slot (doctor_branch, day, end_time, start_time) VALUES (?, ?, ?, ?)', [doctor_branch_id, day, end_time, start_time]);
            const doctorTimeSlot = await this.getDoctorTimeSlotById(conn, rows.insertId);
            return doctorTimeSlot;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlotById(conn: PoolConnection, doctorTimeSlotId: number): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM doctor_time_slot WHERE id = ?', [doctorTimeSlotId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_TIME_SLOT_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlotByIdOrNull(conn: PoolConnection, doctorTimeSlotId: number): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM doctor_time_slot WHERE id = ?', [doctorTimeSlotId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_TIME_SLOT_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlot(conn: PoolConnection, doctor_branch: number, day: number): Promise<DoctorTimeSlot[]> {
        try {
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM doctor_time_slot WHERE doctor_branch = ? AND day = ?', [doctor_branch, day]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM doctor_branch WHERE doctor_id = ? AND branch_id = ?', [doctorId, branchId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_BRANCH_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getAllDoctorTimeSlot(conn: PoolConnection, doctorId: number): Promise<DoctorTimeSlot[]> {
        try {
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM doctor_time_slot WHERE doctor_id = ?', [doctorId]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getAllDoctorBranch(conn: PoolConnection, doctorId: number): Promise<DoctorBranch[]> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM doctor_branch WHERE doctor_id = ?', [doctorId]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

}