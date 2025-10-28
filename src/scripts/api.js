/**
 * API Module для работы с Backend
 * 
 * ИСПРАВЛЕНО:
 * - Endpoint отмены бронирования: DELETE /bookings/{id}
 */

export class API {
    constructor() {
        // URL вашего backend API (через ngrok)
        this.baseURL = window.API_URL || 'http://localhost:8000/api';
        
        console.log('🔗 API Base URL:', this.baseURL);
    }

    /**
     * Получить заголовки для запросов
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'  // ← ВАЖНО: Пропускает предупреждение ngrok
        };

        // Добавляем Telegram initData для авторизации
        if (window.Telegram?.WebApp?.initData) {
            headers['Authorization'] = `tma ${window.Telegram.WebApp.initData}`;
        }

        return headers;
    }

    /**
     * Обработка ответов API
     */
    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.json().catch(() => ({
                detail: `HTTP ${response.status}: ${response.statusText}`
            }));
            throw new Error(error.detail || error.message || 'Ошибка API');
        }
        return response.json();
    }

    /**
     * Получить информацию о салоне
     */
    async getSalon() {
        try {
            const response = await fetch(`${this.baseURL}/salon`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getSalon:', error);
            throw error;
        }
    }

    /**
     * Получить список мастеров
     */
    async getMasters() {
        try {
            const response = await fetch(`${this.baseURL}/masters`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getMasters:', error);
            throw error;
        }
    }

    /**
     * Получить мастера по ID
     */
    async getMaster(masterId) {
        try {
            const response = await fetch(`${this.baseURL}/masters/${masterId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getMaster:', error);
            throw error;
        }
    }

    /**
     * Получить услуги мастера
     */
    async getMasterServices(masterId) {
        try {
            const response = await fetch(`${this.baseURL}/masters/${masterId}/services`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getMasterServices:', error);
            throw error;
        }
    }

    /**
     * Получить услугу по ID
     */
    async getService(serviceId) {
        try {
            const response = await fetch(`${this.baseURL}/services/${serviceId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getService:', error);
            throw error;
        }
    }

    /**
     * Получить доступные слоты
     */
    async getAvailableSlots(masterId, date) {
        try {
            const response = await fetch(
                `${this.baseURL}/schedule/${masterId}?date=${date}`,
                {
                    method: 'GET',
                    headers: this.getHeaders()
                }
            );
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getAvailableSlots:', error);
            throw error;
        }
    }

    /**
     * Создать бронирование
     */
    async createBooking(bookingData) {
        try {
            const response = await fetch(`${this.baseURL}/bookings`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(bookingData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка createBooking:', error);
            throw error;
        }
    }

    /**
     * Получить мои записи
     */
    async getMyBookings() {
        try {
            const response = await fetch(`${this.baseURL}/bookings/my`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка getMyBookings:', error);
            throw error;
        }
    }

    /**
     * Отменить бронирование
     * 
     * ИСПРАВЛЕНО: DELETE /bookings/{id} вместо POST /bookings/{id}/cancel
     */
    async cancelBooking(bookingId) {
        try {
            const response = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: this.getHeaders()
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка cancelBooking:', error);
            throw error;
        }
    }

    /**
     * Создать отзыв
     */
    async createReview(reviewData) {
        try {
            const response = await fetch(`${this.baseURL}/reviews`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(reviewData)
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('❌ Ошибка createReview:', error);
            throw error;
        }
    }
}

// Глобальный экземпляр
export const api = new API();
