import { Redeem } from "@models/redeem";
import { ERRORS } from "@utils/error";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import createLogger from "@utils/logger";

const logger = createLogger('@redeemRepository')

export default class RedeemRepository {
    async saveRedeem(connection: PoolConnection, user_id: number, booking_id: number, service_id: number): Promise<Redeem> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO redeem (user_id, booking_id, service_id) VALUES (?, ?, ?)', [user_id, booking_id, service_id]);
            const [redeem,] = await connection.query<Redeem[]>('SELECT * from redeem where id = ?', [result.insertId]);
            return redeem[0]
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async alreadyRedeemedByUser(connection: PoolConnection, user_id: number): Promise<Redeem[]> {
        try {
            const [redeem,] = await connection.query<Redeem[]>('SELECT * from redeem where user_id = ?', [user_id]);
            return redeem
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllRedeems(connection: PoolConnection): Promise<Redeem[]> {
        try {
            const [redeem,] = await connection.query<Redeem[]>('SELECT * from redeem');
            return redeem
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllUsers(connection: PoolConnection): Promise<number[]> {
        try {
            const [redeem,] = await connection.query<Redeem[]>('SELECT DISTINCT user_id from redeem');
            return redeem.map(r => r.user_id)
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

}
