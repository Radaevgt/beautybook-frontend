/**
 * Admin Bookings Module
 * Управление записями
 */

import { formatDate, formatTime, showToast, showModal, closeModal } from './utils.js';

export class AdminBookings {
    constructor(api) {
        this.api = api;
        this.bookings = [];
        this.filters = {
            date_from: null,
            date_to: null,
            master_id: null,
            status: null,
            search: ''
        };
    }

    /**
     * Отрисовка страницы записей
     */
    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            await this.loadBookings();

            const html = `
                <div class="admin-bookings">
                    <div class="page-header">
                        <h1>Управление записями</h1>
                        <button class="btn-primary" onclick="adminApp.bookings.showCreateModal()">
                            <i class="fas fa-plus"></i> Новая запись
                        </button>
                    </div>

                    <!-- Фильтры -->
                    <div class="filters-panel">
                        ${this.renderFilters()}
                    </div>

                    <!-- Список записей -->
                    <div class="bookings-container">
                        ${this.renderBookings()}
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;
            this.attachEventListeners();

        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            showToast('Ошибка загрузки записей', 'error');
        }
    }

    /**
     * Загрузить записи с фильтрами
     */
    async loadBookings() {
        try {
            const params = new URLSearchParams();
            
            if (this.filters.date_from) params.append('date_from', this.filters.date_from);
            if (this.filters.date_to) params.append('date_to', this.filters.date_to);
            if (this.filters.master_id) params.append('master_id', this.filters.master_id);
            if (this.filters.status) params.append('status', this.filters.status);
            if (this.filters.search) params.append('search', this.filters.search);

            const url = `/api/admin/bookings${params.toString() ? '?' + params.toString() : ''}`;
            this.bookings = await this.api.request(url);

        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            this.bookings = [];
        }
    }

    /**
     * Отрисовка фильтров
     */
    renderFilters() {
        return `
            <div class="filters-row">
                <input 
                    type="date" 
                    id="filter-date-from" 
                    class="filter-input"
                    value="${this.filters.date_from || ''}"
                    placeholder="Дата от"
                >
                <input 
                    type="date" 
                    id="filter-date-to" 
                    class="filter-input"
                    value="${this.filters.date_to || ''}"
                    placeholder="Дата до"
                >
                <select id="filter-status" class="filter-select">
                    <option value="">Все статусы</option>
                    <option value="confirmed" ${this.filters.status === 'confirmed' ? 'selected' : ''}>Подтверждено</option>
                    <option value="completed" ${this.filters.status === 'completed' ? 'selected' : ''}>Завершено</option>
                    <option value="cancelled" ${this.filters.status === 'cancelled' ? 'selected' : ''}>Отменено</option>
                    <option value="no_show" ${this.filters.status === 'no_show' ? 'selected' : ''}>Не пришёл</option>
                </select>
                <input 
                    type="search" 
                    id="filter-search" 
                    class="filter-input"
                    value="${this.filters.search}"
                    placeholder="Поиск по имени или телефону"
                >
            </div>
            <div class="filters-actions">
                <button class="btn-secondary" onclick="adminApp.bookings.applyFilters()">
                    <i class="fas fa-filter"></i> Применить
                </button>
                <button class="btn-link" onclick="adminApp.bookings.resetFilters()">
                    Сбросить
                </button>
            </div>
        `;
    }

    /**
     * Отрисовка списка записей
     */
    renderBookings() {
        if (this.bookings.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-times"></i>
                    <h3>Записей не найдено</h3>
                    <p>Измените фильтры или создайте новую запись</p>
                </div>
            `;
        }

        // Группируем по датам
        const grouped = this.groupByDate(this.bookings);

        return Object.keys(grouped).map(date => `
            <div class="bookings-date-group">
                <h3 class="date-header">${formatDate(date)}</h3>
                <div class="bookings-list">
                    ${grouped[date].map(booking => this.renderBookingCard(booking)).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Отрисовка карточки записи
     */
    renderBookingCard(booking) {
        return `
            <div class="booking-card" onclick="adminApp.bookings.showDetails(${booking.id})">
                <div class="booking-time">
                    <div class="booking-hour">${booking.time_start}</div>
                    <div class="booking-duration">${booking.time_end}</div>
                </div>
                
                <div class="booking-info">
                    <div class="booking-client">
                        <i class="fas fa-user"></i>
                        ${booking.client_name}
                    </div>
                    <div class="booking-phone">
                        <i class="fas fa-phone"></i>
                        ${booking.client_phone}
                    </div>
                    <div class="booking-service">
                        <i class="fas fa-scissors"></i>
                        ${booking.service?.name || 'Услуга'}
                    </div>
                    <div class="booking-master">
                        <i class="fas fa-user-tie"></i>
                        ${booking.master?.name || 'Мастер'}
                    </div>
                </div>

                <div class="booking-meta">
                    <div class="booking-price">${booking.price} ₽</div>
                    <div class="booking-status status-${booking.status}">
                        ${this.getStatusLabel(booking.status)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Показать детали записи
     */
    async showDetails(bookingId) {
        try {
            const booking = await this.api.request(`/api/admin/bookings/${bookingId}`);

            const html = `
                <div class="modal-header">
                    <h2>Запись №${booking.id}</h2>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>

                <div class="modal-body">
                    <div class="booking-details">
                        <div class="detail-section">
                            <h3>Информация о клиенте</h3>
                            <div class="detail-row">
                                <span class="detail-label">Имя:</span>
                                <span class="detail-value">${booking.client_name}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Телефон:</span>
                                <span class="detail-value">
                                    <a href="tel:${booking.client_phone}">${booking.client_phone}</a>
                                </span>
                            </div>
                        </div>

                        <div class="detail-section">
                            <h3>Детали записи</h3>
                            <div class="detail-row">
                                <span class="detail-label">Дата:</span>
                                <span class="detail-value">${formatDate(booking.date)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Время:</span>
                                <span class="detail-value">${booking.time_start} - ${booking.time_end}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Мастер:</span>
                                <span class="detail-value">${booking.master?.name || '-'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Услуга:</span>
                                <span class="detail-value">${booking.service?.name || '-'}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Стоимость:</span>
                                <span class="detail-value">${booking.price} ₽</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Статус:</span>
                                <span class="booking-status status-${booking.status}">
                                    ${this.getStatusLabel(booking.status)}
                                </span>
                            </div>
                        </div>

                        ${booking.comment ? `
                            <div class="detail-section">
                                <h3>Комментарий</h3>
                                <p>${booking.comment}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="modal-footer">
                    <div class="modal-actions">
                        ${this.renderStatusActions(booking)}
                        <button class="btn-danger" onclick="adminApp.bookings.cancelBooking(${booking.id})">
                            <i class="fas fa-times"></i> Отменить запись
                        </button>
                    </div>
                </div>
            `;

            showModal(html);

        } catch (error) {
            console.error('Ошибка загрузки деталей:', error);
            showToast('Ошибка загрузки деталей записи', 'error');
        }
    }

    /**
     * Отрисовка кнопок действий по статусу
     */
    renderStatusActions(booking) {
        if (booking.status === 'confirmed') {
            return `
                <button class="btn-success" onclick="adminApp.bookings.completeBooking(${booking.id})">
                    <i class="fas fa-check"></i> Завершить
                </button>
                <button class="btn-warning" onclick="adminApp.bookings.markNoShow(${booking.id})">
                    <i class="fas fa-user-slash"></i> Не пришёл
                </button>
            `;
        } else if (booking.status === 'completed') {
            return '<span class="text-success"><i class="fas fa-check-circle"></i> Запись завершена</span>';
        } else if (booking.status === 'cancelled') {
            return '<span class="text-muted"><i class="fas fa-times-circle"></i> Запись отменена</span>';
        }
        return '';
    }

    /**
     * Завершить запись
     */
    async completeBooking(bookingId) {
        try {
            await this.api.request(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'completed' })
            });

            showToast('Запись успешно завершена', 'success');
            closeModal();
            this.render();

        } catch (error) {
            console.error('Ошибка завершения записи:', error);
            showToast('Ошибка при завершении записи', 'error');
        }
    }

    /**
     * Отметить как "не пришёл"
     */
    async markNoShow(bookingId) {
        try {
            await this.api.request(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'no_show' })
            });

            showToast('Статус изменён на "Не пришёл"', 'success');
            closeModal();
            this.render();

        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
            showToast('Ошибка при изменении статуса', 'error');
        }
    }

    /**
     * Отменить запись
     */
    async cancelBooking(bookingId) {
        const confirmed = confirm('Вы уверены, что хотите отменить эту запись?');
        if (!confirmed) return;

        try {
            await this.api.request(`/api/admin/bookings/${bookingId}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'cancelled' })
            });

            showToast('Запись успешно отменена', 'success');
            closeModal();
            this.render();

        } catch (error) {
            console.error('Ошибка отмены записи:', error);
            showToast('Ошибка при отмене записи', 'error');
        }
    }

    /**
     * Показать форму создания записи
     */
    async showCreateModal() {
        // TODO: Реализовать создание записи
        showToast('Создание записи (в разработке)', 'info');
    }

    /**
     * Применить фильтры
     */
    applyFilters() {
        this.filters.date_from = document.getElementById('filter-date-from').value;
        this.filters.date_to = document.getElementById('filter-date-to').value;
        this.filters.status = document.getElementById('filter-status').value;
        this.filters.search = document.getElementById('filter-search').value;

        this.render();
    }

    /**
     * Сбросить фильтры
     */
    resetFilters() {
        this.filters = {
            date_from: null,
            date_to: null,
            master_id: null,
            status: null,
            search: ''
        };

        this.render();
    }

    /**
     * Подключить обработчики событий
     */
    attachEventListeners() {
        // Поиск в реальном времени
        const searchInput = document.getElementById('filter-search');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.applyFilters(), 500);
            });
        }
    }

    /**
     * Группировать записи по датам
     */
    groupByDate(bookings) {
        return bookings.reduce((groups, booking) => {
            const date = booking.date;
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(booking);
            return groups;
        }, {});
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
}

console.log('✅ AdminBookings модуль загружен');