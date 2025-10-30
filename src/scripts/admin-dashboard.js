/**
 * Admin Dashboard
 * Главная страница админ-панели
 */

import { formatDate, formatTime, showToast } from './utils.js';

export class AdminDashboard {
    constructor(api) {
        this.api = api;
        this.stats = null;
    }

    /**
     * Отрисовка дашборда
     */
    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            // Загружаем статистику
            await this.loadStats();

            const html = `
                <div class="admin-dashboard">
                    <div class="dashboard-header">
                        <h1>Панель управления</h1>
                        <p class="dashboard-date">${this.getGreeting()}</p>
                    </div>

                    <!-- Быстрая статистика -->
                    <div class="stats-cards">
                        ${this.renderStatsCards()}
                    </div>

                    <!-- Ближайшие записи -->
                    <div class="dashboard-section">
                        <div class="section-header">
                            <h2>Ближайшие записи</h2>
                            <button class="btn-link" onclick="adminApp.navigateTo('bookings')">
                                Все записи
                            </button>
                        </div>
                        <div id="upcoming-bookings">
                            ${this.renderUpcomingBookings()}
                        </div>
                    </div>

                    <!-- Отзывы на модерации -->
                    ${this.renderPendingReviews()}

                    <!-- Быстрые действия -->
                    <div class="dashboard-section">
                        <h2>Быстрые действия</h2>
                        <div class="quick-actions">
                            <button class="quick-action-btn" onclick="adminApp.bookings.showCreateModal()">
                                <i class="fas fa-plus-circle"></i>
                                <span>Новая запись</span>
                            </button>
                            <button class="quick-action-btn" onclick="adminApp.masters.showCreateModal()">
                                <i class="fas fa-user-plus"></i>
                                <span>Добавить мастера</span>
                            </button>
                            <button class="quick-action-btn" onclick="adminApp.services.showCreateModal()">
                                <i class="fas fa-plus-square"></i>
                                <span>Новая услуга</span>
                            </button>
                            <button class="quick-action-btn" onclick="adminApp.navigateTo('stats')">
                                <i class="fas fa-chart-bar"></i>
                                <span>Статистика</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;

        } catch (error) {
            console.error('Ошибка загрузки дашборда:', error);
            document.getElementById('app').innerHTML = `
                <div class="error-page">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Ошибка загрузки</h2>
                    <p>Не удалось загрузить данные дашборда</p>
                    <button class="btn-primary" onclick="location.reload()">
                        Обновить
                    </button>
                </div>
            `;
        }
    }

    /**
     * Загрузить статистику
     */
    async loadStats() {
        try {
            const response = await this.api.request('/api/admin/stats/dashboard');
            this.stats = response;
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            // Используем моковые данные для разработки
            this.stats = {
                today: {
                    total_bookings: 0,
                    completed: 0,
                    cancelled: 0,
                    new_clients: 0
                },
                upcoming_bookings: [],
                pending_reviews: 0
            };
        }
    }

    /**
     * Приветствие в зависимости от времени
     */
    getGreeting() {
        const hour = new Date().getHours();
        const today = new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            weekday: 'long'
        });

        let greeting = '';
        if (hour < 12) greeting = 'Доброе утро';
        else if (hour < 18) greeting = 'Добрый день';
        else greeting = 'Добрый вечер';

        return `${greeting}! Сегодня ${today}`;
    }

    /**
     * Отрисовка карточек статистики
     */
    renderStatsCards() {
        const { today } = this.stats;

        return `
            <div class="stat-card">
                <div class="stat-icon" style="background: #4CAF50;">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${today.total_bookings}</div>
                    <div class="stat-label">Записей сегодня</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: #2196F3;">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${today.completed}</div>
                    <div class="stat-label">Завершено</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: #FF9800;">
                    <i class="fas fa-user-plus"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${today.new_clients}</div>
                    <div class="stat-label">Новых клиентов</div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon" style="background: #F44336;">
                    <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-value">${today.cancelled}</div>
                    <div class="stat-label">Отменено</div>
                </div>
            </div>
        `;
    }

    /**
     * Отрисовка ближайших записей
     */
    renderUpcomingBookings() {
        const bookings = this.stats.upcoming_bookings || [];

        if (bookings.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <p>Нет ближайших записей</p>
                </div>
            `;
        }

        return `
            <div class="bookings-list">
                ${bookings.map(booking => `
                    <div class="booking-card" onclick="adminApp.bookings.showDetails(${booking.id})">
                        <div class="booking-time">
                            <div class="booking-date">${formatDate(booking.date)}</div>
                            <div class="booking-hour">${booking.time_start}</div>
                        </div>
                        <div class="booking-info">
                            <div class="booking-client">${booking.client_name}</div>
                            <div class="booking-service">${booking.service?.name || 'Услуга'}</div>
                            <div class="booking-master">
                                <i class="fas fa-user"></i>
                                ${booking.master?.name || 'Мастер'}
                            </div>
                        </div>
                        <div class="booking-status status-${booking.status}">
                            ${this.getStatusLabel(booking.status)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Отрисовка отзывов на модерации
     */
    renderPendingReviews() {
        const count = this.stats.pending_reviews || 0;

        if (count === 0) {
            return '';
        }

        return `
            <div class="dashboard-section">
                <div class="alert alert-warning" onclick="adminApp.navigateTo('reviews')">
                    <div class="alert-icon">
                        <i class="fas fa-star"></i>
                    </div>
                    <div class="alert-content">
                        <div class="alert-title">Отзывы требуют модерации</div>
                        <div class="alert-text">
                            ${count} ${this.getPluralForm(count, 'отзыв', 'отзыва', 'отзывов')} ожидает публикации
                        </div>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                </div>
            </div>
        `;
    }

    /**
     * Получить метку статуса
     */
    getStatusLabel(status) {
        const labels = {
            'confirmed': 'Подтверждено',
            'completed': 'Завершено',
            'cancelled': 'Отменено',
            'no_show': 'Не пришёл'
        };
        return labels[status] || status;
    }

    /**
     * Получить правильную форму множественного числа
     */
    getPluralForm(n, form1, form2, form5) {
        n = Math.abs(n) % 100;
        const n1 = n % 10;
        
        if (n > 10 && n < 20) return form5;
        if (n1 > 1 && n1 < 5) return form2;
        if (n1 === 1) return form1;
        return form5;
    }
}

console.log('✅ AdminDashboard модуль загружен');