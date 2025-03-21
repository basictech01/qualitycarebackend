
import { EncryptionRepository } from '@repository/encryption';
import UserRepository from '@repository/user';
import SMSRepository from '@repository/sms';
import pool from '@utils/db';
import { ERRORS, RequestError } from '@utils/error';
import createLogger from '@utils/logger';
import { PoolConnection } from 'mysql2/promise';
import { AuthUser, User } from '@models/user';
import { createAuthToken, createRefreshToken, decodeRefreshToken } from '@utils/jwt';

const logger = createLogger('@userService');

export class UserService {
    userRepository: UserRepository;
    smsRepository: SMSRepository;
    encryptionRepository: EncryptionRepository;

    constructor() {
        this.userRepository = new UserRepository();
        this.smsRepository = new SMSRepository();
        this.encryptionRepository = new EncryptionRepository();
    }

    async createRegisterUserHash(email: string, password: string, name: string, phone_number: string, national_id: string | undefined, photo_url: string | undefined): Promise<string> {
        // Check if user exists
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            await this.userRepository.checkIfUserExists(connection, email, phone_number, national_id);
            const otp = await this.smsRepository.sendOTP(phone_number);
            const data = {
                email,
                password,
                name,
                phone_number,
                national_id,
                photo_url,
                otp
            };
            const encryptedData = await this.encryptionRepository.encryptJSON(data);
            return encryptedData;
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

    async verifyUserAndCreate(hash: string, otp: number): Promise<AuthUser> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const data = await this.encryptionRepository.decryptJSON(hash);
            if (data.otp !== otp) {
                throw ERRORS.INVALID_OTP;
            }
            const password_hash = await this.encryptionRepository.hashPassword(data.password);
            const user = await this.userRepository.createUser(connection, data.email, password_hash, data.name, data.phone_number, data.national_id, data.photo_url);
            const accessToken = createAuthToken({ id: user.id, is_admin: user.is_admin });
            const refreshToken = createRefreshToken({ id: user.id, is_admin: user.is_admin });
            return {
                full_name: user.full_name,
                email_address: user.email_address,
                phone_number: user.phone_number,
                national_id: user.national_id,
                photo_url: user.photo_url,
                access_token: accessToken,
                refresh_token: refreshToken
            }
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

    async loginWithEmailPassword(email: string, password: string): Promise<AuthUser> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const user = await this.userRepository.getUserByEmail(connection, email);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const isPasswordCorrect = await this.encryptionRepository.comparePassword(password, user.password_hash);
            console.log(isPasswordCorrect)
            if (!isPasswordCorrect) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const accessToken = createAuthToken({ id: user.id, is_admin: user.is_admin });
            const refreshToken = createRefreshToken({ id: user.id, is_admin: user.is_admin });
            return {
                full_name: user.full_name,
                email_address: user.email_address,
                phone_number: user.phone_number,
                national_id: user.national_id,
                photo_url: user.photo_url,
                access_token: accessToken,
                refresh_token: refreshToken
            }
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

    async loginWithPhone(phone_number: string): Promise<string> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const user = await this.userRepository.getUserByPhone(connection, phone_number);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const otp = await this.smsRepository.sendOTP(phone_number);
            const data = {
                phone_number,
                otp
            };
            const encryptedData = await this.encryptionRepository.encryptJSON(data);
            return encryptedData;
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

    async loginPhoneVerify(hash: string, otp: number): Promise<AuthUser> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const data = await this.encryptionRepository.decryptJSON(hash);
            if (data.otp !== otp) {
                throw ERRORS.INVALID_OTP;
            }
            const user = await this.userRepository.getUserByPhone(connection, data.phone_number);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const accessToken = createAuthToken({ id: user.id, is_admin: user.is_admin });
            const refreshToken = createRefreshToken({ id: user.id, is_admin: user.is_admin });
            return {
                full_name: user.full_name,
                email_address: user.email_address,
                phone_number: user.phone_number,
                national_id: user.national_id,
                photo_url: user.photo_url,
                access_token: accessToken,
                refresh_token: refreshToken
            }
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

    async refreshToken(refreshToken: string): Promise<AuthUser> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const payload = decodeRefreshToken(refreshToken);
            const user = await this.userRepository.getUserById(connection, payload.id);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const accessToken = createAuthToken({ id: user.id, is_admin: user.is_admin });
            return {
                full_name: user.full_name,
                email_address: user.email_address,
                phone_number: user.phone_number,
                national_id: user.national_id,
                photo_url: user.photo_url,
                access_token: accessToken,
                refresh_token: refreshToken
            }
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            } else {
                logger.error(e);
                throw ERRORS.INTERNAL_SERVER_ERROR;
            }
        }
    }

    async updateUser(id: number, email_address: string | undefined, full_name: string | undefined, national_id: string | undefined, photo_url: string | undefined): Promise<User> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const user = await this.userRepository.getUserById(connection, id);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            await this.userRepository.updateUser(connection, id, email_address, full_name, national_id, photo_url);
            const updatedUser = await this.userRepository.getUserById(connection, id);
            return updatedUser;
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

    async creteResetPasswordHash(email_address: string): Promise<String> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const user = await this.userRepository.getUserByEmail(connection, email_address);
            if (!user) {
                throw ERRORS.USER_NOT_FOUND;
            }
            const otp = await this.smsRepository.sendOTP(user.phone_number);
            const data = {
                email: user.email_address,
                otp
            };
            const encryptedData = await this.encryptionRepository.encryptJSON(data);
            return encryptedData
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

    async resetPassword(hash: string, otp: number, password: string): Promise<void> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const data = await this.encryptionRepository.decryptJSON(hash);
            if (data.otp !== otp) {
                throw ERRORS.INVALID_OTP;
            }
            const password_hash = await this.encryptionRepository.hashPassword(password);
            await this.userRepository.updatePassword(connection, data.email, password_hash);
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
