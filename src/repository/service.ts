import { Service, ServiceBranch, ServiceCategory, ServiceTimeSlot } from "@models/service";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";
import { PoolConnection, ResultSetHeader } from "mysql2/promise";

const logger = createLogger('@serviceRepository')

export default class ServiceRepository {
    async getAllServices(connection: PoolConnection): Promise<Service[]> {
        try {
            const [services,] = await connection.query<Service[]>('SELECT * from service');
            return services;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceById(connection: PoolConnection, service_id: number): Promise<Service> {
        try {
            const [services,] = await connection.query<Service[]>('SELECT * from service WHERE id = ?', [service_id]);
            return services[0];
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getAllServicesCategories(connection: PoolConnection): Promise<ServiceCategory[]> {
        try {
            const [services,] = await connection.query<ServiceCategory[]>('SELECT * from service_category');
            return services;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceCategoryById(connection: PoolConnection, category_id: number): Promise<ServiceCategory> {
        try {
            const [services,] = await connection.query<ServiceCategory[]>('SELECT * from service_category WHERE id = ?', [category_id]);
            return services[0];
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async getServiceCategoryByIdOrNull(connection: PoolConnection, category_id: number): Promise<ServiceCategory | null> {
        try {
            const [services,] = await connection.query<ServiceCategory[]>('SELECT * from service_category WHERE id = ?', [category_id]);
            if (services.length === 0) {
                return null;
            }
            return services[0];
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async create(connection: PoolConnection, name_en: string, name_ar: string, category_id: number, about_en: string, about_ar: string, actual_price: number, discounted_price: number, maximum_booking_per_slot: number, service_image_en_url: string, service_image_ar_url: string, can_redeem: boolean): Promise<Service> {
        try {
            const [result] = await connection.query<ResultSetHeader>('INSERT INTO service (name_en, name_ar, category_id, about_en, about_ar, actual_price, discounted_price, maximum_booking_per_slot, service_image_en_url, service_image_ar_url, can_redeem) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name_en, name_ar, category_id, about_en, about_ar, actual_price, discounted_price, maximum_booking_per_slot, service_image_en_url, service_image_ar_url, can_redeem]);
            const service = await this.getServiceById(connection, result.insertId);
            return service;
        } catch (error) {
            logger.error(`Error creating service: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async update(connection: PoolConnection, id: number, name_en: string, name_ar: string, category_id: number, about_en: string, about_ar: string, actual_price: number, discounted_price: number, maximum_booking_per_slot: number, service_image_en_url: string, service_image_ar_url: string, can_redeem: boolean): Promise<Service> {
        try {
            await connection.query<ResultSetHeader>(
                'UPDATE service SET name_en = ?, name_ar = ?, category_id = ?, about_en = ?, about_ar = ?, actual_price = ?, discounted_price = ?, maximum_booking_per_slot = ?, service_image_en_url = ?, service_image_ar_url = ?, can_redeem = ? WHERE id = ?',
                [name_en, name_ar, category_id, about_en, about_ar, actual_price, discounted_price, maximum_booking_per_slot, service_image_en_url, service_image_ar_url, can_redeem, id]
            );
            const updatedService = await this.getServiceById(connection, id);
            return updatedService;
        } catch (error) {
            logger.error(`Error updating service: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        }
    }

    async getAllServicesByCategory(connection: PoolConnection, category_id: number): Promise<Service[]> {
        try {
            const [services,] = await connection.query<Service[]>('SELECT * from service WHERE category_id = ?', [category_id]);
            return services;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }

    async createCategory(connection: PoolConnection, name_en: string, name_ar: string, type: string): Promise<ServiceCategory> {
        try {
            const [result] = await connection.query<ResultSetHeader>('INSERT INTO service_category (name_en, name_ar, type) VALUES (?, ?, ?)', [name_en, name_ar, type]);
            const category = await this.getServiceCategoryById(connection, result.insertId);
            return category;
        } catch (error) {
            logger.error(`Error creating category: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getTimeSlots(connection: PoolConnection, service_id: number): Promise<ServiceTimeSlot[]> {
        try {
            const [timeSlots,] = await connection.query<ServiceTimeSlot[]>('SELECT * from service_time_slot WHERE service_id = ?', [service_id]);
            return timeSlots;
        } catch (e) {
            if (e instanceof RequestError) {
                throw e;
            }
            logger.error(e)
            throw ERRORS.DATABASE_ERROR
        }
    }
    
    async createServiceTimeSlot(connection: PoolConnection, service_id: number, start_time: Date, end_time: Date): Promise<ServiceTimeSlot> {
        try {
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO service_time_slot (service_id, start_time, end_time) VALUES (?, ?, ?)',
                [service_id, start_time, end_time]
            );
            const [timeSlots,] = await connection.query<ServiceTimeSlot[]>('SELECT * from service_time_slot WHERE id = ?', [result.insertId]);
            return timeSlots[0];
        } catch (error) {
            logger.error(`Error creating service time slot: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async addServiceToBranch(connection: PoolConnection, service_id: number, branch_id: number): Promise<ServiceBranch> {
        try {
            const [result] = await connection.query<ResultSetHeader>(
                'INSERT INTO branch_service (branch_id, service_id) VALUES (?, ?)',
                [branch_id, service_id]
            );
            const [serviceBranch,] = await connection.query<ServiceBranch[]>('SELECT * from branch_service WHERE branch_id = ? AND service_id = ?', [branch_id, service_id]);
            return serviceBranch[0];
        } catch (error) {
            logger.error(`Error adding service to branch: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        }
    }

    async getServicesForBranch(connection: PoolConnection, branch_id: number): Promise<Service[]> {
        try {
            const [services,] = await connection.query<Service[]>(
                'SELECT s.* FROM service s JOIN branch_service bs ON s.id = bs.service_id WHERE bs.branch_id = ?',
                [branch_id]
            );
            return services;
        } catch (error) {
            logger.error(`Error getting services for branch: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        }
    }

    async getRedeemableServices(connection: PoolConnection): Promise<Service[]> {
        try {
            const [services,] = await connection.query<Service[]>(
                'SELECT * FROM service WHERE can_redeem = 1'
            );
            return services;
        } catch (error) {
            logger.error(`Error getting redeemable services: ${error}`);
            throw ERRORS.DATABASE_ERROR;
        }
    }

    
}