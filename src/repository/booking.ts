import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@userRepository')


export default class BookingRepository {
    async checkIfBookingExists(connection: PoolConnection, bookingID: number): Promise<void> {
        try {
            return

            // TODO: yet to implement

            // const [bookings,] = await connection.query<Booking[]>('SELECT * from booking where id  = ?', [bookingID]);
            // if (bookings.length === 0) {
            //     throw ERRORS.BOOKING_NOT_FOUND;
            // }

        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}
