import { verifyClient } from "@middleware/auth";
import { NextFunction, Router, Response } from "express";

import { Request } from '@customTypes/connection';
import { ERRORS, RequestError } from "@utils/error";
import RedeemRepository from '@repository/redeem';
import { PoolConnection } from "mysql2/promise";
import pool from "@utils/db";
import BookingRepository from "@repository/booking";

const REDEEM_QPOINTS = 8;
const QPOINTS_TO_REDEEM = 500;

export default class RedeemService {
    redeemRepository: RedeemRepository;
    bookingRepository: BookingRepository;

    constructor() {
        this.redeemRepository = new RedeemRepository();
        this.bookingRepository = new BookingRepository();
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
            const totalQPoints = totalSpend / QPOINTS_TO_REDEEM;

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

}