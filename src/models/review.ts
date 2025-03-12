import { RowDataPacket } from "mysql2";

const DEFINATION = `
CREATE TABLE "review" (
    id INT PRIMARY KEY,
    user_id INT,
    booking_id INT,
    created_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    rating INT
)
CREATE TABLE "comment" (
    id INT PRIMARY KEY,
    review_id INT,
    comment TEXT,
)
`

export interface Review extends RowDataPacket {
    id: number;
    user_id: number;
    booking_id: number;
    created_timestamp: Date;
    rating: number;
}

export interface ReviewComment extends RowDataPacket {
    id: number;
    review_id: number;
    comment: string;
}
