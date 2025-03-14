
import { RowDataPacket } from "mysql2";

const DEFINATION = `
CREATE TABLE redeem (
    id INT PRIMARY KEY,
    user_id INT,
    booking_id INT,
    service_id INT
)`

export interface Redeem extends RowDataPacket {
    id: number;
    user_id: number;
    booking_id: number;
    service_id: number;
}
