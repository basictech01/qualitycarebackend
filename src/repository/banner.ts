import { Banner } from "@models/banner";
import { ERRORS } from "@utils/error";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";
import createLogger from "@utils/logger";

const logger = createLogger('@bannerRepository')

export default class BannerRepository {
    async getBanners(connection: PoolConnection): Promise<Banner[]> {
        try {
            const [banners,] = await connection.query<Banner[]>('SELECT * from banner');
            return banners
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
    async createBanner(connection: PoolConnection, image_en: string, image_ar: string, link: string, start_timestamp: string, end_timestamp: string): Promise<Banner> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO banner (image_english_url, image_arabic_url, link, start_timestamp, end_timestamp) VALUES (?, ?, ?, ?, ?)', [image_en, image_ar, link, start_timestamp, end_timestamp]);
            const [banner,] = await connection.query<Banner[]>('SELECT * from banner where id = ?', [result.insertId]);
            return banner[0]
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}
