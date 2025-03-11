import { Banner } from "@models/banner";
import BannerRepository from "@repository/banner";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection } from "mysql2/promise";


const logger = createLogger('@bannerService');

export default class BannerService {
    bannerRepository: BannerRepository;
    constructor() {
        this.bannerRepository = new BannerRepository();
    }

    async getBanners(): Promise<Banner[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.bannerRepository.getBanners(connection);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async createBanner(image_en: string, image_ar: string, link: string, start_timestamp: string, end_timestamp: string): Promise<Banner> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            return await this.bannerRepository.createBanner(connection, image_en, image_ar, link, start_timestamp, end_timestamp);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

}
