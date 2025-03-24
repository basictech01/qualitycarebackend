
import { RowDataPacket } from "mysql2/promise";


const DEFINATION_BOOKING_SERVICE = `
CREATE TABLE booking_service (
    id INT PRIMARY KEY,
    user_id INT -> user_id, full_name, email_address
    branch_id INT -> branch_id, name_en, name_ar
    service_id INT, -> service_id, actual_price, discounted_price, name_en, name_ar, category_id, category_tye category_name_en, category_name_ar
    time_slot_id INT -> time_slot_id, start_time, end_time
    date varchar(255),
    status ENUM('SCHEDULED', 'CANCELED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
);
`

export interface BookingServiceI {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    service_id: number;
    time_slot_id: number;
    date: string;
    branch_id: number;
}

const DEFINATION_BOOKING = `
CREATE TABLE booking_doctor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL -> user_id, full_name, email_address
    status ENUM('SCHEDULED', 'CANCELED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
    doctor_id INT NOT NULL -> doctor_id, name_en, name_ar, photo_url
    time_slot_id INT NOT NULL -> time_slot_id, start_time, end_time
    branch_id INT NOT NULL -> branch_id, name_en, name_ar
    date varchar(255)
);
`

export interface BookingDoctor {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    doctor_id: number;
    branch_id: number;
    time_slot_id: number;
    date: string;
}

export interface BookingDoctorView {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    start_time: string;
    end_time: string;
    branch_name_en: string;
    branch_name_ar: string;
    name_ar: string;
    name_en: string;
    photo_url: string;
    date: string;
}

export interface BookingServiceView {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    branch_name_en: string;
    branch_name_ar: string;
    start_time: string;
    end_time: string;
    name_ar: string;
    name_en: string;
    category_name_en: string;
    category_name_ar: string;
    service_image_en_url: string;
    service_image_ar_url: string;
    date: string;
}

export interface TotalVisitsPerUser {
    user_id: number;
    total_visits: number;
}


export interface BookingServiceDetails {
    id: number;
    user_id: number;
    user_full_name: string;
    user_email: string;
    branch_id: number;
    branch_name_en: string;
    branch_name_ar: string;
    service_id: number;
    service_actual_price: number;
    service_discounted_price: number | null; // Discounted price can be null
    service_name_en: string;
    service_name_ar: string;
    service_category_id: number;
    service_category_type: 'DENTIST' | 'DERMATOLOGIST'; // Assuming these are the ENUM values
    service_category_name_en: string;
    service_category_name_ar: string;
    time_slot_id: number;
    time_slot_start_time: string; // Representing TIME as string
    time_slot_end_time: string; // Representing TIME as string
    booking_date: string; // Representing DATE as string
    booking_status: 'SCHEDULED' | 'RESCHEDULE' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
}


export interface BookingDoctorDetails {
    id: number;
    user_id: number;
    user_full_name: string;
    user_email: string;
    booking_status: 'SCHEDULED' | 'RESCHEDULE' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    doctor_id: number;
    doctor_name_en: string;
    doctor_name_ar: string;
    doctor_session_fees: string;
    doctor_photo_url: string | null; // photo_url can be null
    time_slot_id: number;
    time_slot_start_time: string; // Representing TIME as string
    time_slot_end_time: string; // Representing TIME as string
    branch_id: number;
    branch_name_en: string;
    branch_name_ar: string;
    booking_date: string; // Representing DATE as string
  }