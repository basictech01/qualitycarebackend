import { Review, ReviewComment } from "@models/review";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@reviewRepository')

export default class ReviewRepository {
    async checkIfReviewExists(connection: PoolConnection, reviewID: number): Promise<void> {
        try {
            const [reviews,] = await connection.query<Review[]>('SELECT * from review where id  = ?', [reviewID]);
            if (reviews.length === 0) {
                throw ERRORS.REVIEW_NOT_FOUND;
            }
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async createReviewComment(connection: PoolConnection, reviewID: number, comment: string): Promise<ReviewComment> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO comment (review_id,comment) VALUES (?,?)', [reviewID, comment]);
            const [reviews,] = await connection.query<ReviewComment[]>('SELECT * from review where id = ?', [result.insertId]);
            return reviews[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async createReview(connection: PoolConnection, userID: number, bookingID: number, rating: number, review: string | undefined): Promise<Review> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO review (user_id,booking_id,rating,review) VALUES (?,?,?,?)', [userID, bookingID, rating, review || '']);
            const [reviews,] = await connection.query<Review[]>('SELECT * from review where id = ?', [result.insertId]);
            return reviews[0];
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getReviews(connection: PoolConnection, id: number): Promise<Review[]> {
        try {
            const [reviews,] = await connection.query<Review[]>('SELECT * from user where id = ?', [id]);
            return reviews;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

}
