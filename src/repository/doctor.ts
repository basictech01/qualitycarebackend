import { Doctor, DoctorBranch, DoctorTimeSlot } from "@models/doctor";
import { ERRORS } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

const logger = createLogger('@doctorRepository')

interface DoctorRow extends Doctor, RowDataPacket  {}
interface DoctorBranchRow extends DoctorBranch, RowDataPacket  {}
interface DoctorTimeSlotRow extends DoctorTimeSlot, RowDataPacket  {}

export default class DoctorRepository {

    async getAllDoctors(conn: PoolConnection): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<DoctorRow[]>('SELECT * FROM doctor');
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async setAllDoctorBranchInactive(conn: PoolConnection, doctorId: number): Promise<void> {
        try {
            await conn.query('UPDATE doctor_branch SET is_active = FALSE WHERE doctor_id = ?', [doctorId]);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorByIds(conn: PoolConnection, doctorIds: number[]): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<DoctorRow[]>('SELECT * FROM doctor WHERE id IN (?)', [doctorIds]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorById(conn: PoolConnection, doctorId: number): Promise<Doctor> {
        try {
            const [rows] = await conn.query<DoctorRow[]>('SELECT * FROM doctor WHERE id = ?', [doctorId]);
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
            const [rows] = await conn.query<DoctorRow[]>('SELECT * FROM doctor WHERE id = ?', [doctorId]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0] as Doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctor(conn: PoolConnection, about_ar: string, about_en: string, attended_patient: number, languages: string, name_ar: string, name_en: string, photo_url: string, qualification: string, session_fees: number, total_experience: number, is_active: boolean): Promise<Doctor> {
        try {
            const [result] = await conn.query<ResultSetHeader>('INSERT INTO doctor (about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience, is_active]);
            const doctor = await this.getDoctorById(conn, result.insertId);
            return doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorForBranches(conn: PoolConnection, branchIds: number[]): Promise<DoctorBranch[]> {
        try {
            const [rows] = await conn.query<DoctorBranchRow[]>('SELECT * FROM doctor_branch WHERE branch_id IN (?)', [branchIds]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async addDoctorToBranch(conn: PoolConnection, doctorId: number, day_map: string, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<ResultSetHeader>('INSERT INTO doctor_branch (doctor_id, day_map, branch_id) VALUES (?, ?, ?)', [doctorId, day_map, branchId]);
            const doctorBranch = await this.getDoctorBranchById(conn, rows.insertId);
            return doctorBranch;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async searchDoctorBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch | null> {
        try {
            const [rows] = await conn.query<DoctorBranchRow[]>('SELECT * FROM doctor_branch WHERE doctor_id = ? AND branch_id = ?', [doctorId, branchId]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0];
        }
        catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async updateDoctorBranchActiveAndDayHash(conn: PoolConnection, doctor_branch_id: number, day_map: string, is_active: boolean): Promise<DoctorBranch> {
        try {
            await conn.query('UPDATE doctor_branch SET day_map = ?, is_active = ? WHERE id = ?', [day_map, is_active, doctor_branch_id]);
            const doctorBranch = await this.getDoctorBranchById(conn, doctor_branch_id);
            return doctorBranch;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctorBranch(conn: PoolConnection, doctorId: number, branchId: number, day_hash: string): Promise<DoctorBranch> {
        try {
            const doctor_branch = await this.searchDoctorBranch(conn, doctorId, branchId);
            if (doctor_branch) {
                const doctorBranch = await this.updateDoctorBranchActiveAndDayHash(conn, doctor_branch.id, day_hash, true);
                return doctorBranch;
            } else {
                return this.addDoctorToBranch(conn, doctorId, day_hash, branchId);
            }
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranchById(conn: PoolConnection, doctorBranchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranchRow[]>('SELECT * FROM doctor_branch WHERE id = ?', [doctorBranchId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_BRANCH_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async searchDoctorTimeSlot(conn: PoolConnection, doctorId: number, start_time: string, end_time: string): Promise<DoctorTimeSlot | null> {
        try {
            const [rows] = await conn.query<DoctorTimeSlotRow[]>('SELECT * FROM doctor_time_slot WHERE doctor_id = ? AND  start_time = ? AND end_time = ?', [doctorId, start_time, end_time]);
            if (rows.length === 0) {
                return null;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async setActiveDoctorTimeSlot(conn: PoolConnection, doctorTimeSlotId: number, isActive: boolean): Promise<DoctorTimeSlot> {
        try {
            await conn.query('UPDATE doctor_time_slot SET is_active = ? WHERE id = ?', [isActive, doctorTimeSlotId]);
            const doctorTimeSlot = await this.getDoctorTimeSlotById(conn, doctorTimeSlotId);
            return doctorTimeSlot;
        }
        catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async createDoctorTimeSlot(conn: PoolConnection, doctor_id: number, end_time: string, start_time: string): Promise<DoctorTimeSlot> {
        try {
            const doctor_time_slot = await this.searchDoctorTimeSlot(conn, doctor_id, start_time, end_time);
            if (doctor_time_slot) {
                const doctorTimeSlot = await this.setActiveDoctorTimeSlot(conn, doctor_time_slot.id, true);
                return doctorTimeSlot;
            } else {
                const [rows] = await conn.query<ResultSetHeader>('INSERT INTO doctor_time_slot (doctor_id, end_time, start_time) VALUES (?, ?, ?)', [doctor_id, end_time, start_time]);
                const doctorTimeSlot = await this.getDoctorTimeSlotById(conn, rows.insertId);
                return doctorTimeSlot;
            }
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async setAllDoctorTimeSlotInactive(conn: PoolConnection, doctorId: number): Promise<void> {
        try {
            await conn.query('UPDATE doctor_time_slot SET is_active = FALSE WHERE doctor_id = ?', [doctorId]);
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlotById(conn: PoolConnection, doctorTimeSlotId: number): Promise<DoctorTimeSlot> {
        try {
            const [rows] = await conn.query<DoctorTimeSlotRow[]>('SELECT * FROM doctor_time_slot WHERE id = ?', [doctorTimeSlotId]);
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
            const [rows] = await conn.query<DoctorTimeSlotRow[]>('SELECT * FROM doctor_time_slot WHERE id = ?', [doctorTimeSlotId]);
            if (rows.length === 0) {
                throw ERRORS.DOCTOR_TIME_SLOT_NOT_FOUND;
            }
            return rows[0];
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorTimeSlot(conn: PoolConnection, doctor_id: number): Promise<DoctorTimeSlot[]> {
        try {
            const [rows] = await conn.query<DoctorTimeSlotRow[]>('SELECT * FROM doctor_time_slot WHERE doctor_id = ? AND is_active = 1', [doctor_id]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getDoctorBranch(conn: PoolConnection, doctorId: number, branchId: number): Promise<DoctorBranch> {
        try {
            const [rows] = await conn.query<DoctorBranchRow[]>('SELECT * FROM doctor_branch WHERE doctor_id = ? AND branch_id = ?', [doctorId, branchId]);
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
            const [rows] = await conn.query<DoctorTimeSlotRow[]>('SELECT * FROM doctor_time_slot WHERE doctor_id = ?', [doctorId]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getAllDoctorBranch(conn: PoolConnection, doctorId: number): Promise<DoctorBranch[]> {
        try {
            const [rows] = await conn.query<DoctorBranchRow[]>('SELECT * FROM doctor_branch WHERE doctor_id = ?', [doctorId]);
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async getFeaturedDoctors(conn: PoolConnection): Promise<Doctor[]> {
        try {
            const [rows] = await conn.query<DoctorRow[]>('SELECT * FROM doctor order by attended_patient desc limit 5');
            return rows;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

    async updateDoctor(conn: PoolConnection, doctorId: number, about_ar: string, about_en: string, attended_patient: number, languages: string, name_ar: string, name_en: string, photo_url: string, qualification: string, session_fees: number, total_experience: number, is_active: boolean): Promise<Doctor> {
        try {
            await conn.query('UPDATE doctor SET about_ar = ?, about_en = ?, attended_patient = ?, languages = ?, name_ar = ?, name_en = ?, photo_url = ?, qualification = ?, session_fees = ?, total_experience = ?, is_active = ? WHERE id = ?', [about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience, is_active, doctorId]);
            const doctor = await this.getDoctorById(conn, doctorId);
            return doctor;
        } catch (e) {
            logger.error(e);
            throw e;
        }
    }

}