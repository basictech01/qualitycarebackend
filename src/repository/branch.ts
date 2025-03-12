import { ERRORS } from "@utils/error";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import createLogger from "@utils/logger";
import { Branch } from "@models/branch";

const logger = createLogger('@branchRepository')

export default class BranchRepository {
    async getBranch(connection: PoolConnection): Promise<Branch[]> {
        try {
            const [branch,] = await connection.query<Branch[]>('SELECT * from branch');
            return branch
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
    async createBranch(connection: PoolConnection, name_ar: string, name_en: string, city_en: string, city_ar: string, latitude: number, longitude: number): Promise<Branch> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO branch (name_ar,name_en,city_en,city_ar,latitude,longitude) VALUES (?,?,?,?,?,?)', [name_ar, name_en, city_en, city_ar, latitude, longitude]);
            const [branch,] = await connection.query<Branch[]>('SELECT * from branch where id = ?', [result.insertId]);
            return branch[0]
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}
