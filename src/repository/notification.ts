import { ERRORS } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

import { Notification } from "@models/notification";

const logger = createLogger('@notificationRepository')

export default class NotificationRepository {

    async insertNotification(connection: PoolConnection, message_ar: string, message_en: string, title_ar: string, title_en: string, scheduled_timestamp: Date): Promise<Notification> {
        try {
            const [result,] = await connection.query<ResultSetHeader>('INSERT INTO notification (message_ar, message_en, title_ar, title_en, scheduled_timestamp) VALUES (?, ?, ?, ?, ?)', [message_ar, message_en, title_ar, title_en, scheduled_timestamp]);
            const [notification,] = await connection.query<Notification[]>('SELECT * from notification where id = ?', [result.insertId]);
            return notification[0]
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getNotifications(connection: PoolConnection): Promise<Notification[]> {
        try {
            const [notification,] = await connection.query<Notification[]>('SELECT * from notification where scheduled_timestamp < now()');
            return notification
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllNotifications(connection: PoolConnection): Promise<Notification[]> {
        try {
            const [notification,] = await connection.query<Notification[]>('SELECT * from notification');
            return notification
        } catch (e) {
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
}

