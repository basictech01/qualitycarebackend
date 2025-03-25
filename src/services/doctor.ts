import { Branch } from "@models/branch";
import { Doctor, DoctorBranch, DoctorTimeSlot, DoctorTimeSlotAvailable, DoctorTimeSlotView } from "@models/doctor";
import BookingRepository from "@repository/booking";
import BranchRepository from "@repository/branch";
import DoctorRepository from "@repository/doctor";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@doctorService');


interface TimeSlots {
    start_time: string,
    end_time: string
}

interface DoctorBranches {
    day_map: string,
    branch_id: number
}
export default class DoctorService {
    doctorRepository: DoctorRepository;
    branchRepository: BranchRepository;
    bookingRepository: BookingRepository;

    constructor() {
        this.doctorRepository = new DoctorRepository();
        this.branchRepository = new BranchRepository();
        this.bookingRepository = new BookingRepository();
    }

    async getDoctorsFromID(id: number): Promise<Doctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.doctorRepository.getDoctorById(connection, id);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getAllDoctors(): Promise<Doctor[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.doctorRepository.getAllDoctors(connection);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getDoctorBranchInfo(doctor_id: number): Promise<Branch[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.doctorRepository.getDoctorBranchInfo(connection, doctor_id);
        }
        catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async createDoctor(about_ar: string, about_en: string, attended_patient: number, languages: string, name_ar: string, name_en: string, photo_url: string, qualification: string, session_fees: number, total_experience: number, is_active: boolean): Promise<Doctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return this.doctorRepository.createDoctor(connection, about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience, is_active);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getDoctorBranches(doctor_id: number): Promise<DoctorBranch[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            return await this.doctorRepository.getDoctorBranches(connection, doctor_id);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getDoctorForACity(city: string): Promise<Doctor[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const branch = await this.branchRepository.getBranchForCity(connection, city);
            if (branch.length === 0) {
                throw ERRORS.BRANCH_NOT_FOUND;
            }
            const branch_id_list = branch.map(b => b.id);
            const doctors = await this.doctorRepository.getDoctorForBranches(connection, branch_id_list);
            const doctor_id_list = doctors.map(d => d.doctor_id);
            return await this.doctorRepository.getDoctorByIds(connection, doctor_id_list);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getDoctorBranch(doctor_id: number, branch_id: number): Promise<DoctorBranch> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            const branch = await this.branchRepository.getBranchByIdOrNull(connection, branch_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            if (!branch) {
                throw ERRORS.BRANCH_NOT_FOUND;
            }
            return await this.doctorRepository.getDoctorBranch(connection, doctor_id, branch_id);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    validateDayMap(day_map: string) {
        if (day_map.length !== 7) {
            throw ERRORS.INVALID_DAY_MAPPING;
        }
        for (let i = 0; i < day_map.length; i++) {
            if (day_map[i] !== '1' && day_map[i] !== '0') {
                throw ERRORS.INVALID_DAY_MAPPING;
            }
        }
    }

    async addDoctorToBranch(doctor_id: number, doctor_branches: DoctorBranches[]): Promise<DoctorBranch[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const result: DoctorBranch[] = [];
            for(const d of doctor_branches) {
                this.validateDayMap(d.day_map);
                const branch = await this.branchRepository.getBranchByIdOrNull(connection, d.branch_id);
                if (!branch) {
                    throw ERRORS.BRANCH_NOT_FOUND;
                }
                const doctorBranch = await this.doctorRepository.createDoctorBranch(connection, doctor_id, d.branch_id, d.day_map);
                result.push(doctorBranch);
            }
            return result;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async setAllDoctorBranchInactive(doctor_id: number): Promise<void> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await this.doctorRepository.setAllDoctorBranchInactive(connection, doctor_id);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            } 
        }finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async updateDoctorBranch(doctor_id: number, doctor_branches: DoctorBranches[]): Promise<DoctorBranch[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const result: DoctorBranch[] = [];
            await this.doctorRepository.setAllDoctorBranchInactive(connection, doctor_id);
            for(const d of doctor_branches) {
                this.validateDayMap(d.day_map);
                const branch = await this.branchRepository.getBranchByIdOrNull(connection, d.branch_id);
                if (!branch) {
                    throw ERRORS.BRANCH_NOT_FOUND;
                }
                const doctorBranch = await this.doctorRepository.createDoctorBranch(connection, doctor_id, d.branch_id, d.day_map);
                result.push(doctorBranch);
            }
            return result;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            } 
        }finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async crateDoctorTimeSlot(doctor_id: number, start_time: string, end_time: string): Promise<DoctorTimeSlotView> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            await this.doctorRepository.createDoctorTimeSlot(connection, doctor_id, start_time, end_time);
            return {
                doctor_id: doctor_id,
                start_time: start_time,
                end_time: end_time
            }
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async crateDoctorTimeSlots(doctor_id: number, time_slots: TimeSlots[]): Promise<DoctorTimeSlotView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const result: DoctorTimeSlotView[] = [];
            for(const time_slot of time_slots) {
                await this.doctorRepository.createDoctorTimeSlot(connection, doctor_id, time_slot.start_time, time_slot.end_time);
                result.push({
                    doctor_id: doctor_id,
                    start_time: time_slot.start_time,
                    end_time: time_slot.end_time
                });
            }
            return result;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async updateDoctorTimeSlots(doctor_id: number, time_slots: TimeSlots[]): Promise<DoctorTimeSlotView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const result: DoctorTimeSlotView[] = [];
            await this.doctorRepository.setAllDoctorTimeSlotInactive(connection, doctor_id);
            for(const time_slot of time_slots) {
                await this.doctorRepository.createDoctorTimeSlot(connection, doctor_id, time_slot.start_time, time_slot.end_time);
                result.push({
                    doctor_id: doctor_id,
                    start_time: time_slot.start_time,
                    end_time: time_slot.end_time
                });
            }
            return result;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }


    async getDoctorTimeSlot(doctor_id: number): Promise<DoctorTimeSlotView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            const doctor_time_slot = await this.doctorRepository.getDoctorTimeSlot(connection, doctor_id);
            return doctor_time_slot.map(d => {
                return {
                    doctor_id: doctor_id,
                    start_time: d.start_time,
                    end_time: d.end_time
                }
            });
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getAllDoctorTimeSlot(doctor_id: number): Promise<DoctorTimeSlot[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const doctor_time_slot = await this.doctorRepository.getAllDoctorTimeSlot(connection, doctor_id);
            return doctor_time_slot
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }


    async getAvailableTimeSlots(doctor_id: number, branch_id: number, day: number, date: string): Promise<DoctorTimeSlotAvailable[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctorBranch = await this.doctorRepository.getDoctorBranch(connection, doctor_id, branch_id);
            const doctor_time_slot = await this.doctorRepository.getDoctorTimeSlot(connection, doctor_id);
            const booking = await this.bookingRepository.getDoctorBooking(connection, doctor_id, date);
            const booking_time_slot = booking.map(b => b.time_slot_id);
            logger.error(booking)
            return doctor_time_slot.map(d => {
                return {
                    available: !booking_time_slot.includes(d.id),
                    doctor_id: doctor_id,
                    branch_id: branch_id,
                    start_time: d.start_time,
                    end_time: d.end_time
                }
            });

        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        }   finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getFeaturedDoctors(): Promise<Doctor[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.doctorRepository.getFeaturedDoctors(connection);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async updateDoctor(doctor_id: number, about_ar: string | undefined, about_en: string | undefined, attended_patient: number | undefined, languages: string | undefined, name_ar: string | undefined, name_en: string | undefined, photo_url: string | undefined, qualification: string | undefined, session_fees: number | undefined, total_experience: number | undefined, is_active: boolean | undefined): Promise<Doctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            if (about_ar) {
                doctor.about_ar = about_ar;
            }
            if (about_en) {
                doctor.about_en = about_en;
            }
            if (attended_patient) {
                doctor.attended_patient = attended_patient;
            }
            if (languages) {
                doctor.languages = languages;
            }
            if (name_ar) {
                doctor.name_ar = name_ar;
            }
            if (name_en) {
                doctor.name_en = name_en;
            }
            if (photo_url) {
                doctor.photo_url = photo_url;
            }
            if (qualification) {
                doctor.qualification = qualification;
            }
            if (session_fees) {
                doctor.session_fees = session_fees;
            }
            if (total_experience) {
                doctor.total_experience = total_experience;
            }
            if (is_active) {
                doctor.is_active = is_active;
            }
            return await this.doctorRepository.updateDoctor(connection, doctor_id, doctor.about_ar, doctor.about_en, doctor.attended_patient, doctor.languages, doctor.name_ar, doctor.name_en, doctor.photo_url, doctor.qualification, doctor.session_fees, doctor.total_experience, doctor.is_active);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }

    }
}