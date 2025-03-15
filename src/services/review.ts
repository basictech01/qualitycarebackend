import { Review, ReviewComment } from "@models/review";
import BookingRepository from "@repository/booking";
import ReviewRepository from "@repository/review";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@settingService');

export default class ReviewService {
    reviewRepository: ReviewRepository;
    bookingRepository: BookingRepository;

    constructor() {
        this.reviewRepository = new ReviewRepository();
        this.bookingRepository = new BookingRepository();
    }

    async createReview(userID: number, bookingID: number, rating: number, review: string): Promise<Review> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            let booking = await this.bookingRepository.getBookingService(connection, bookingID);
            if (!booking) {
                throw ERRORS.BOOKING_NOT_FOUND;
            }
            await this.reviewRepository.checkIfReviewExists(connection, bookingID);
            return await this.reviewRepository.createReview(connection, userID, bookingID, rating, review);
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

    async createComment(reviewID: number, comment: string): Promise<ReviewComment> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await this.reviewRepository.checkIfReviewExists(connection, reviewID);
            let com = await this.reviewRepository.createReviewComment(connection, reviewID, comment);
            return com;
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
