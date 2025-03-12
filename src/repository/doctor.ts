import { Doctor, DoctorBranch, DoctorTimeSlot } from "@models/doctor";
import { DefaultSetting, Setting, SettingView } from "@models/setting";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@doctorRepository')

export default class DoctorRepository {

    async getAllDoctors(conn: PoolConnection): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM Doctor');
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorById(conn: PoolConnection, doctorId: number): Promise<Doctor> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM Doctor WHERE id = ?', [doctorId]);
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
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM Doctor WHERE id = ?', [doctorId]);
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
            const [result] = await conn.query<ResultSetHeader>('INSERT INTO Doctor (about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience]);
            const doctor = await this.getDoctorById(conn, result.insertId);
            return doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorForBranches(conn: PoolConnection, branchIds: number[]): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<Doctor[]>('SELECT * FROM Doctor WHERE branch_id IN (?)', [branchIds]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async addDoctorToBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<ResultSetHeader>('INSERT INTO DoctorBranch (doctor_id, branch_id) VALUES (?, ?)', [doctorId, branchId]);
            const doctorBranch = await this.getDoctorBranchById(conn, rows.insertId);
            return doctorBranch;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranchById(conn: PoolConnection, doctorBranchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM DoctorBranch WHERE id = ?', [doctorBranchId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_BRANCH_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctorTimeSlot(conn: PoolConnection, doctorId: number, day: number, end_time: string, start_time: string): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<ResultSetHeader>('INSERT INTO DoctorTimeSlot (doctor_id, day, end_time, start_time) VALUES (?, ?, ?, ?)', [doctorId, day, end_time, start_time]);
            const doctorTimeSlot = await this.getDoctorTimeSlotById(conn, rows.insertId);
            return doctorTimeSlot;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlotById(conn: PoolConnection, doctorTimeSlotId: number): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM DoctorTimeSlot WHERE id = ?', [doctorTimeSlotId]);
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
            const [rows] = await conn.query<DoctorTimeSlot[]>('SELECT * FROM DoctorTimeSlot WHERE doctor_branch ? AND day = ?', [doctor_branch, day]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranch[]>('SELECT * FROM DoctorBranch WHERE doctor_id = ? AND branch_id = ?', [doctorId, branchId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_BRANCH_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

}