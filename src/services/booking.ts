import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@settingService');

export default class BookingService {
    bookingRepository: BookingRepository;

    constructor() {
        this.bookingRepository = new BookingRepository();
    }

}
