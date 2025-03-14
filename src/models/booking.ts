
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

export interface BookingServiceI extends RowDataPacket {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    service_id: number;
    time_slot_id: number;
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

export interface BookingDoctor extends RowDataPacket {
    id: number;
    user_id: number;
    status: 'SCHEDULED' | 'CANCELED' | 'REFUND_INITIATED' | 'REFUND_COMPLETED' | 'COMPLETED';
    doctor_id: number;
    time_slot_id: number;
}

