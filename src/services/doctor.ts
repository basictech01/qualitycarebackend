import { Doctor, DoctorBranch, DoctorTimeSlotAvailable, DoctorTimeSlotView } from "@models/doctor";
import BookingRepository from "@repository/booking";
import BranchRepository from "@repository/branch";
import DoctorRepository from "@repository/doctor";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@doctorService');

export default class DoctorService {
    doctorRepository: DoctorRepository;
    branchRepository: BranchRepository;
    bookingRepository: BookingRepository;

    constructor() {
        this.doctorRepository = new DoctorRepository();
        this.branchRepository = new BranchRepository();
        this.bookingRepository = new BookingRepository();
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

    async createDoctor(about_ar: string, about_en: string, attended_patient: number, languages: string, name_ar: string, name_en: string, photo_url: string, qualification: string, session_fees: number, total_experience: number): Promise<Doctor> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return this.doctorRepository.createDoctor(connection, about_ar, about_en, attended_patient, languages, name_ar, name_en, photo_url, qualification, session_fees, total_experience);
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

    async addDoctorToBranch(doctor_id: number, branch_id: number): Promise<DoctorBranch> {
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
            return await this.doctorRepository.addDoctorToBranch(connection, doctor_id, branch_id);
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

    async crateDoctorTimeSlot(doctor_id: number, day: number, start_time: string, end_time: string, branch_id: number): Promise<DoctorTimeSlotView> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const doctor = await this.doctorRepository.getDoctorByIdOrNull(connection, doctor_id);
            if (!doctor) {
                throw ERRORS.DOCTOR_NOT_FOUND;
            }
            const doctorBranch = await this.doctorRepository.getDoctorBranch(connection, doctor_id, branch_id);
            if (!doctorBranch) {
                throw ERRORS.DOCTOR_NOT_ASSIGNED_TO_BRANCH;
            }
            await this.doctorRepository.createDoctorTimeSlot(connection, doctorBranch.id, day, start_time, end_time);
            return {
                day: day,
                doctor_id: doctor_id,
                branch_id: branch_id,
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

    async getDoctorTimeSlot(doctor_id: number, branch_id: number, day: number): Promise<DoctorTimeSlotView[]> {
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
            const doctorBranch = await this.doctorRepository.getDoctorBranch(connection, doctor_id, branch_id);
            const doctor_time_slot = await this.doctorRepository.getDoctorTimeSlot(connection, doctorBranch.id, day);
            return doctor_time_slot.map(d => {
                return {
                    day: d.day,
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
            const doctor_time_slot = await this.doctorRepository.getDoctorTimeSlot(connection, doctorBranch.id, day);
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
}