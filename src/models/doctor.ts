import { RowDataPacket } from "mysql2";

export const DEFINATION = `
CREATE TABLE doctor (
    id INT PRIMARY KEY,
    session_fees INT NOT NULL,
    attended_patient INT DEFAULT 0,
    total_experience INT NOT NULL,
    about_en TEXT,
    about_ar TEXT,
    qualification TEXT,
    languages TEXT,
    name_en VARCHAR(1024) NOT NULL,
    name_ar VARCHAR(1024) NOT NULL,
    photo_url TEXT
);
`

export interface Doctor  {
    id: number;
    session_fees: number;
    attended_patient: number;
    total_experience: number;
    about_en: string;
    about_ar: string;
    qualification: string;
    languages: string;
    name_en: string;
    name_ar: string;
    photo_url: string;
}

export interface DoctorView extends Doctor {
    branches: number[];
}


export const DOCTOR_BRANCH = `
CREATE TABLE doctor_branch(
    int PRIMARY KEY,
    doctor_id INT NOT NULL,
    day INT NOT NULL,
    branch_id INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY (doctor_id, branch_id)
);
`

export interface DoctorBranch  {
    id: number;
    doctor_id: number;
    day: number;
    branch_id: number;
}

export const DOCTOR_TIME_SLOT = `
CREATE TABLE doctor_time_slot (
    id INT PRIMARY KEY,
    doctor_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
);
`

export interface DoctorTimeSlot  {
    id: number;
    doctor_id: number;
    start_time: string;
    end_time: string;
}

export interface DoctorTimeSlotView  {
    doctor_id: number;
    start_time: string;
    end_time: string;
}

export interface DoctorTimeSlotAvailable {
    available: boolean;
    doctor_id: number;
    branch_id: number;
    start_time: string;
    end_time: string;
}


