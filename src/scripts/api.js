/**
 * API клиент для работы с Backend
 */

class API {
    constructor(baseURL) {
        this.baseURL = baseURL || CONFIG.API_URL;
        this.telegramApp = window.telegramApp;
    }
    
    /**
     * Базовый запрос
     */
    async request(endpoint, options = {}) {
    try {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true',  // ← ДОБАВЬТЕ ЭТУ СТРОКУ
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
    
    /**
     * GET запрос
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        return this.request(url, {
            method: 'GET'
        });
    }
    
    /**
     * POST запрос
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * PUT запрос
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * PATCH запрос
     */
    async patch(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
    
    /**
     * DELETE запрос
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // ============================================
    // SALON
    // ============================================
    
    async getSalon() {
        return this.get('/salon');
    }
    
    // ============================================
    // MASTERS
    // ============================================
    
    async getMasters(params = {}) {
        return this.get('/masters', params);
    }
    
    async getMaster(id) {
        return this.get(`/masters/${id}`);
    }
    
    async getMasterServices(id) {
        return this.get(`/masters/${id}/services`);
    }
    
    // ============================================
    // SERVICES
    // ============================================
    
    async getServiceCategories() {
        return this.get('/services/categories');
    }
    
    async getServices(params = {}) {
        return this.get('/services', params);
    }
    
    async getService(id) {
        return this.get(`/services/${id}`);
    }
    
    async getServiceMasters(id) {
        return this.get(`/services/${id}/masters`);
    }
    
    // ============================================
    // BOOKINGS
    // ============================================
    
    async getSchedule(masterId, date) {
        return this.get(`/schedule/${masterId}`, { date });
    }
    
    async createBooking(data) {
        return this.post('/bookings', data);
    }
    
    async getMyBookings(status = null) {
        const params = status ? { status } : {};
        return this.get('/bookings/my', params);
    }
    
    async cancelBooking(id) {
        return this.delete(`/bookings/${id}`);
    }
    
    // ============================================
    // REVIEWS
    // ============================================
    
    async createReview(data) {
        return this.post('/reviews', data);
    }
    
    async getMasterReviews(masterId, params = {}) {
        return this.get(`/masters/${masterId}/reviews`, params);
    }
}

// Создаём экземпляр API
const api = new API();
