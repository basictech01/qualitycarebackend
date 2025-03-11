import { User } from "@models/user";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@userRepository')


export default  class UserRepository {
    async checkIfUserExists (connection: PoolConnection, email: string, phone_number: string, national_id: string | undefined): Promise<void> {
        try {
            const [users,] = await connection.query<User[]>('SELECT * from user where email_address = ?', [email]);
            if (users.length > 0) {
                throw ERRORS.EMAIL_ALREADY_EXISTS;
            }
            const [users2,] = await connection.query<User[]>('SELECT * from user where phone_number = ?', [phone_number]);
            if (users2.length > 0) {
                throw ERRORS.PHONE_ALREADY_EXISTS;
            }
            if (national_id) {
                const [users3,] = await connection.query<User[]>('SELECT * from user where national_id = ?', [national_id]);
                if (users3.length > 0) {
                    throw ERRORS.NATIONAL_ID_ALREADY_EXISTS;
                }
            }
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
    async createUser (connection: PoolConnection, email: string, password_hash: string, name: string, phone_number: string, national_id: string | undefined, photo_url: string | undefined): Promise<User> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO user (email_address, password_hash, full_name, phone_number, national_id, photo_url) VALUES (?, ?, ?, ?, ?, ?)', [email, password_hash, name, phone_number, national_id, photo_url]);
            const [users,] = await connection.query<User[]>('SELECT * from user where id = ?', [result.insertId]);
            return users[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getUserById (connection: PoolConnection, id: number): Promise<User> {
        try {
            const [users,] = await connection.query<User[]>('SELECT * from user where id = ?', [id]);
            if (users.length === 0) {
                throw ERRORS.USER_NOT_FOUND;
            }
            return users[0];
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getUserByEmail (connection: PoolConnection, email: string): Promise<User> {
        try {
            const [users,] = await connection.query<User[]>('SELECT * from user where email_address = ?', [email]);
            if (users.length === 0) {
                throw ERRORS.USER_NOT_FOUND;
            }
            return users[0];
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}