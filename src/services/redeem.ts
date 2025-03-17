import { ERRORS, RequestError } from "@utils/error";
import RedeemRepository from '@repository/redeem';
import { PoolConnection } from "mysql2/promise";
import pool from "@utils/db";
import BookingRepository from "@repository/booking";

import createLogger from "@utils/logger";
import { Redeem } from "@models/redeem";
import BranchRepository from "@repository/branch";
import UserRepository from "@repository/user";

const logger = createLogger('@redeemService')

const REDEEM_QPOINTS = 8;
const QPOINTS_TO_REDEEM = 500;

export default class RedeemService {
    redeemRepository: RedeemRepository;
    bookingRepository: BookingRepository;
    branchRepository: BranchRepository;
    userRepository: UserRepository;

    constructor() {
        this.redeemRepository = new RedeemRepository();
        this.bookingRepository = new BookingRepository();
        this.branchRepository = new BranchRepository();
        this.userRepository = new UserRepository();
    }

    async redeem(user_id: number, booking_id: number, service_id: number): Promise<any> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const alreadyRedeemed = await this.redeemRepository.alreadyRedeemedByUser(connection, user_id);
            const alreadyRedeemedQPoints = alreadyRedeemed.length * REDEEM_QPOINTS;

            const totalSpendOnDoctor = await this.bookingRepository.getTotalSpendByUserOnDoctor(connection, user_id);
            const totalSpendOnService = await this.bookingRepository.getTotalSpendByUserOnService(connection, user_id);
            const totalSpend = totalSpendOnDoctor + totalSpendOnService;
            const totalQPoints = totalSpend / QPOINTS_TO_REDEEM;

            const remainingQPoints = totalQPoints - alreadyRedeemedQPoints;
            if (remainingQPoints < REDEEM_QPOINTS) {
                throw ERRORS.INSUFFICIENT_QPOINTS;
            }

            this.redeemRepository.saveRedeem(connection, user_id, booking_id, service_id);
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getQPoints(user_id: number): Promise<number> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const alreadyRedeemed = await this.redeemRepository.alreadyRedeemedByUser(connection, user_id);
            const alreadyRedeemedQPoints = alreadyRedeemed.length * REDEEM_QPOINTS;

            const totalSpendOnDoctor = await this.bookingRepository.getTotalSpendByUserOnDoctor(connection, user_id);
            const totalSpendOnService = await this.bookingRepository.getTotalSpendByUserOnService(connection, user_id);

            const totalSpend = totalSpendOnDoctor + totalSpendOnService;
            const totalQPoints = Math.floor(totalSpend / QPOINTS_TO_REDEEM);

            const remainingQPoints = totalQPoints - alreadyRedeemedQPoints;
            return remainingQPoints;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        }
    }

    async getAllRedeems(): Promise<Redeem[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const redeems = await this.redeemRepository.getAllRedeems(connection);
            return redeems;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getUserList(): Promise<any> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const users = await this.redeemRepository.getAllUsers(connection);
            const response = [];
            for (const userId of users) {
                const userDetails = await this.userRepository.getUserById(connection, userId);
                const visitCount = await this.bookingRepository.getVisitCountByUser(connection, userId);
                const totalSpendOnDoctor = await this.bookingRepository.getTotalSpendByUserOnDoctor(connection, userId);
                const totalSpendOnService = await this.bookingRepository.getTotalSpendByUserOnService(connection, userId);

                const totalSpend = totalSpendOnDoctor + totalSpendOnService;
                const totalQPoints = Math.floor(totalSpend / QPOINTS_TO_REDEEM);
                response.push({
                    user_id: userDetails.id,
                    name: userDetails.name,
                    visitCount: visitCount,
                    stampsCollected: totalQPoints,
                    brancahName: userDetails.branch_name
                })
            }
            return response

        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }


}
