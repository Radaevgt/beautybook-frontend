/**
 * API клиент для взаимодействия с backend
 */

import CONFIG from '../config.js';

class API {
    constructor() {
        this.baseURL = CONFIG.API_URL;
    }
    
    /**
     * Базовый метод для HTTP запросов
     */
    async request(endpoint, options = {}) {
        try {
            const url = `${this.baseURL}${endpoint}`;
            
            const config = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    ...options.headers
                }
            };
            
            if (options.body) {
                config.body = JSON.stringify(options.body);
            }
            
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // Салон
    async getSalon() {
        return this.request('/salon');
    }
    
    // Категории услуг
    async getServiceCategories() {
        return this.request('/services/categories');
    }
    
    // Мастера
    async getMasters() {
        return this.request('/masters');
    }
    
    async getMaster(id) {
        return this.request(`/masters/${id}`);
    }
    
    async getMasterServices(masterId) {
        return this.request(`/masters/${masterId}/services`);
    }
    
    // Услуги
    async getService(id) {
        return this.request(`/services/${id}`);
    }
    
    // Расписание
    async getSchedule(masterId, date) {
        return this.request(`/schedule/${masterId}?date=${date}`);
    }
    
    // Записи
    async createBooking(data) {
        return this.request('/bookings', {
            method: 'POST',
            body: data
        });
    }
    
    async getMyBookings() {
        return this.request('/bookings/my');
    }
}

// Экспорт класса
export { API };
