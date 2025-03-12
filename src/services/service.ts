import { createServiceView, Service, ServiceBranch, ServiceCategory, ServiceTimeSlot, ServiceTimeSlotAvailableView, ServiceView } from "@models/service";
import BranchRepository from "@repository/branch";
import ServiceRepository from "@repository/service";
import pool from "@utils/db";
import { ERRORS, RequestError } from "@utils/error";
import createLogger from "@utils/logger";

import { PoolConnection } from "mysql2/promise";

const logger = createLogger('@serviceService');

export default class SettingService {
    serviceRepository: ServiceRepository;
    branchRepository: BranchRepository;

    constructor() {
        this.serviceRepository = new ServiceRepository();
        this.branchRepository = new BranchRepository();
    }

    async getAll(): Promise<ServiceView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const services = await this.serviceRepository.getAllServices(connection);
            const ServiceCategory = await this.serviceRepository.getAllServicesCategories(connection);
            const serviceCategoryMap = new Map<number, ServiceCategory>();
            ServiceCategory.forEach((category) => {
                serviceCategoryMap.set(category.id, category);
            });
            const serviceViews: ServiceView[] = []
            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const serviceCategory = serviceCategoryMap.get(service.category_id);
                if (!serviceCategory) {
                    continue;
                }
                serviceViews.push(createServiceView(service, serviceCategory));
            }
            return serviceViews;
        } catch (error) {
            logger.error(`Error getting all settings: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async create(name_en: string, name_ar: string, category_id: number, about_en: string, about_ar: string, actual_price: number, discounted_price: number, maximum_booking_per_slot: number, service_image_en_url: string, service_image_ar_url: string, can_redeem: boolean ): Promise<ServiceView> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const service_category = await this.serviceRepository.getServiceCategoryByIdOrNull(connection, category_id);
            if (!service_category) {
                throw ERRORS.INVALID_SERVICE_CATEGORY;
            }
            const service = await this.serviceRepository.create(connection, name_en, name_ar, category_id, about_en, about_ar, actual_price, discounted_price, maximum_booking_per_slot, service_image_en_url, service_image_ar_url, can_redeem);
            return createServiceView(service, service_category);
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            logger.error(`Error creating service: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async update(id: number, name_en: string | undefined, name_ar: string | undefined, category_id: number | undefined, about_en: string | undefined, about_ar: string | undefined, actual_price: number | undefined, discounted_price: number | undefined, maximum_booking_per_slot: number | undefined, service_image_en_url: string | undefined, service_image_ar_url: string | undefined, can_redeem: boolean | undefined): Promise<ServiceView> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const service = await this.serviceRepository.getServiceById(connection, id);
            if (!service) {
                throw ERRORS.SERVICE_NOT_FOUND;
            }
            if(name_en !== undefined) {
                service.name_en = name_en;
            }
            if(name_ar !== undefined) {
                service.name_ar = name_ar;
            }
            if(about_en !== undefined) {
                service.about_en = about_en;
            }
            if(about_ar !== undefined) {
                service.about_ar = about_ar;
            }
            if(actual_price !== undefined) {
                service.actual_price = actual_price;
            }
            if(discounted_price !== undefined) {
                service.discounted_price = discounted_price;
            }
            if(maximum_booking_per_slot !== undefined) {
                service.maximum_booking_per_slot = maximum_booking_per_slot;
            }
            if(service_image_en_url !== undefined) {
                service.service_image_en_url = service_image_en_url;
            }
            if(service_image_ar_url !== undefined) {
                service.service_image_ar_url = service_image_ar_url;
            }
            if(can_redeem !== undefined) {
                service.can_redeem = can_redeem;
            }
            
            let serviceCategory: ServiceCategory;
            if(category_id !== undefined) {
                const serviceCategory_temp = await this.serviceRepository.getServiceCategoryByIdOrNull(connection, category_id);
                if (!serviceCategory_temp) {
                    throw ERRORS.INVALID_SERVICE_CATEGORY;
                }
                serviceCategory = serviceCategory_temp
                service.category_id = category_id;
            } else {
                serviceCategory = await this.serviceRepository.getServiceCategoryById(connection, service.category_id);
            }

            const updatedService = await this.serviceRepository.update(connection, id, service.name_en, service.name_ar, service.category_id, service.about_en, service.about_ar, service.actual_price, service.discounted_price, service.maximum_booking_per_slot, service.service_image_en_url, service.service_image_ar_url, service.can_redeem);
            return createServiceView(updatedService, serviceCategory);
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            logger.error(`Error updating service: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getAllByCategory( category_id: number): Promise<ServiceView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const serviceCategory = await this.serviceRepository.getServiceCategoryById(connection, category_id);
            if (!serviceCategory) {
                throw ERRORS.INVALID_SERVICE_CATEGORY;
            }
            const services = await this.serviceRepository.getAllServicesByCategory(connection, category_id);
            const serviceViews: ServiceView[] = []
            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                serviceViews.push(createServiceView(service, serviceCategory));
            }
            return serviceViews;
        } catch (error) {
            logger.error(`Error getting all settings: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async createCategory(name_en: string, name_ar: string, type: string): Promise<ServiceCategory> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const category = await this.serviceRepository.createCategory(connection, name_en, name_ar, type);
            return category;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            logger.error(`Error creating category: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getTimeSlots(service_id: number): Promise<ServiceTimeSlot[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const service = await this.serviceRepository.getServiceById(connection, service_id);
            if (!service) {
                throw ERRORS.SERVICE_NOT_FOUND;
            }
            const timeSlots = await this.serviceRepository.getTimeSlots(connection, service_id);
            return timeSlots;
        } catch (error) {
            logger.error(`Error getting time slots: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getAvailableTimeSlots(service_id: number, date: Date): Promise<ServiceTimeSlotAvailableView[]> {
        // let connection: PoolConnection | null = null;
        // try {
        //     connection = await pool.getConnection();
        //     const service = await this.serviceRepository.getServiceById(connection, service_id);
        //     if (!service) {
        //         throw ERRORS.SERVICE_NOT_FOUND;
        //     }
        //     const timeSlots = await this.serviceRepository.getAvailableTimeSlots(connection, service_id, date);
        //     return timeSlots;
        // } catch (error) {
        //     logger.error(`Error getting available time slots: ${error}`);
        //     throw ERRORS.INTERNAL_SERVER_ERROR;
        // } finally {
        //     if (connection) {
        //         connection.release();
        //     }
        // }
        return [];
    }

    async createServiceTimeSlot(service_id: number, start_time: Date, end_time: Date): Promise<ServiceTimeSlot> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const service = await this.serviceRepository.getServiceById(connection, service_id);
            if (!service) {
                throw ERRORS.SERVICE_NOT_FOUND;
            }
            const timeSlot = await this.serviceRepository.createServiceTimeSlot(connection, service_id, start_time, end_time);
            return timeSlot;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            logger.error(`Error creating time slot: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getServicesForBranch(branch_id: number): Promise<ServiceView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const branch = await this.branchRepository.getBranchById(connection, branch_id);
            if (!branch) {
                throw ERRORS.BRANCH_NOT_FOUND;
            }
            const services = await this.serviceRepository.getServicesForBranch(connection, branch_id);
            const serviceCategory = await this.serviceRepository.getAllServicesCategories(connection);
            let serviceCategoryMap = new Map<number, ServiceCategory>();
            serviceCategory.forEach((category) => {
                serviceCategoryMap.set(category.id, category);
            });
            const serviceViews: ServiceView[] = []
            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const serviceCategory = serviceCategoryMap.get(service.category_id);
                if (!serviceCategory) {
                    continue;
                }
                serviceViews.push(createServiceView(service, serviceCategory));
            }
            return serviceViews;
        } catch (error) {
            logger.error(`Error getting services for branch: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async addServiceToBranch(service_id: number, branch_id: number ): Promise<ServiceBranch> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const service = await this.serviceRepository.getServiceById(connection, service_id);
            if (!service) {
                throw ERRORS.SERVICE_NOT_FOUND;
            }
            const branch = await this.branchRepository.getBranchById(connection, branch_id);
            if (!branch) {
                throw ERRORS.BRANCH_NOT_FOUND;
            }
            const serviceBranch = await this.serviceRepository.addServiceToBranch(connection, service_id, branch_id);
            return serviceBranch;
        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            logger.error(`Error adding service to branch: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    async getRedeemableServices(): Promise<ServiceView[]> {
        let connection: PoolConnection | null = null;
        try {
            connection = await pool.getConnection();
            const services = await this.serviceRepository.getRedeemableServices(connection);
            const serviceCategory = await this.serviceRepository.getAllServicesCategories(connection);
            let serviceCategoryMap = new Map<number, ServiceCategory>();
            serviceCategory.forEach((category) => {
                serviceCategoryMap.set(category.id, category);
            });
            const serviceViews: ServiceView[] = []
            for (let i = 0; i < services.length; i++) {
                const service = services[i];
                const serviceCategory = serviceCategoryMap.get(service.category_id);
                if (!serviceCategory) {
                    continue;
                }
                serviceViews.push(createServiceView(service, serviceCategory));
            }
            return serviceViews;
        } catch (error) {
            logger.error(`Error getting redeemable services: ${error}`);
            throw ERRORS.INTERNAL_SERVER_ERROR;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}