
import { RowDataPacket } from "mysql2/promise";


const DEFINATION_BOOKING_SERVICE = `
CREATE TABLE booking_service (
    id INT PRIMARY KEY,
    user_id INT,
    branch_id INT,
    service_id INT,
    time_slot_id INT,
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
    user_id INT NOT NULL,
    status ENUM('SCHEDULED', 'CANCELED', 'REFUND_INITIATED', 'REFUND_COMPLETED', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED',
    doctor_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    date varchar(255)
);
`

export interface BookingDoctor {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    doctor_id: number;
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
