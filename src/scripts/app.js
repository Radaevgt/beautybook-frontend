/**
 * Главный файл приложения BeautyBook
 */

import { API } from './api.js';
import { router } from './router.js';
import { telegramApp } from './telegram.js';
import { showLoading, hideLoading, formatDate, formatTime, formatPrice } from './utils.js';

class App {
    constructor() {
        this.api = new API();
        this.state = {
            salon: null,
            categories: [],
            masters: [],
            services: [],
            bookings: [],
            currentMaster: null,
            currentService: null,
            bookingData: {}
        };
        
        this.init();
    }
    
    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Инициализация BeautyBook...');
        
        try {
            // Инициализируем Telegram Web App
            if (window.Telegram?.WebApp) {
                telegramApp.init();
            }
            
            // Показываем загрузку
            showLoading();
            
            // Загружаем начальные данные
            await this.loadInitialData();
            
            // Настраиваем роутер
            this.setupRouter();
            
            // Настраиваем навигацию
            this.setupNavigation();
            
            // Скрываем загрузку
            hideLoading();
            
            console.log('✅ BeautyBook готов!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showErrorScreen('Не удалось загрузить приложение. Попробуйте позже.');
            hideLoading();
        }
    }
    
    /**
     * Загрузить начальные данные
     */
    async loadInitialData() {
        try {
            // Загружаем информацию о салоне
            const salon = await this.api.getSalon();
            
            // Сохраняем в состояние
            this.state.salon = salon;
            
            console.log('Данные загружены:', { salon });
            
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            throw error;
        }
    }
    
    /**
     * Настроить роутер
     */
    setupRouter() {
        // Главная страница
        router.on('/', () => this.renderHome());
        
        // Мастера
        router.on('/masters', () => this.renderMasters());
        router.on('/masters/:id', (params) => this.renderMasterDetail(params.id));
        
        // Мои записи
        router.on('/bookings', () => this.renderMyBookings());
        
        // Профиль
        router.on('/profile', () => this.renderProfile());
        
        // Запускаем роутер
        router.init();
    }
    
    /**
     * Настроить навигацию
     */
    setupNavigation() {
        // Используем делегирование событий для нижней навигации
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const route = navItem.getAttribute('data-route');
                if (route) {
                    router.navigate(route);
                    // Haptic feedback для Telegram
                    if (window.Telegram?.WebApp?.HapticFeedback) {
                        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
                    }
                }
            }
        });
    }
    
    /**
     * Отобразить главную страницу
     */
    async renderHome() {
        const app = document.getElementById('app');
        const salon = this.state.salon;
        
        app.innerHTML = `
            <div class="page">
                <div class="header">
                    <div class="salon-info">
                        ${salon?.logo_url ? `<img src="${salon.logo_url}" alt="Logo" class="salon-logo">` : ''}
                        <h1>${salon?.name || 'Салон Красоты'}</h1>
                    </div>
                </div>
                
                <div class="content">
                    <div class="card">
                        <h2>О салоне</h2>
                        <p>${salon?.description || 'Добро пожаловать в наш салон!'}</p>
                        
                        <div class="salon-details">
                            <div class="detail-item">
                                <span class="icon">📍</span>
                                <div>
                                    <strong>Адрес</strong>
                                    <p>${salon?.address || 'Не указан'}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <span class="icon">📞</span>
                                <div>
                                    <strong>Телефон</strong>
                                    <p>${salon?.phone || 'Не указан'}</p>
                                </div>
                            </div>
                            
                            <div class="detail-item">
                                <span class="icon">🕐</span>
                                <div>
                                    <strong>Режим работы</strong>
                                    <p>${salon?.working_hours || 'Уточняйте по телефону'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary btn-large" id="book-button">
                        Записаться на услугу
                    </button>
                </div>
                
                ${this.renderBottomNav('home')}
            </div>
        `;
        
        // Добавляем обработчик кнопки "Записаться"
        const bookButton = document.getElementById('book-button');
        if (bookButton) {
            bookButton.addEventListener('click', () => {
                router.navigate('/masters');
            });
        }
    }
    
    /**
     * Отобразить список мастеров
     */
    async renderMasters() {
        showLoading();
        
        try {
            const masters = await this.api.getMasters();
            this.state.masters = masters;
            
            const app = document.getElementById('app');
            
            app.innerHTML = `
                <div class="page">
                    <div class="header">
                        <h1>Наши мастера</h1>
                    </div>
                    
                    <div class="content">
                        <div class="masters-grid">
                            ${masters.map(master => `
                                <div class="master-card" data-master-id="${master.id}">
                                    <img src="${master.photo_url || '/assets/images/placeholder.jpg'}" alt="${master.name}">
                                    <div class="master-info">
                                        <h3>${master.name}</h3>
                                        <p class="specialty">${master.specialty}</p>
                                        <div class="master-stats">
                                            <span>⭐ ${master.rating || '5.0'}</span>
                                            <span>📅 ${master.experience} лет</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${this.renderBottomNav('masters')}
                </div>
            `;
            
            // Добавляем обработчики кликов на карточки мастеров
            document.querySelectorAll('.master-card').forEach(card => {
                card.addEventListener('click', () => {
                    const masterId = card.getAttribute('data-master-id');
                    router.navigate(`/masters/${masterId}`);
                });
            });
            
        } catch (error) {
            console.error('Ошибка загрузки мастеров:', error);
            this.showErrorScreen('Не удалось загрузить список мастеров');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить детальную информацию о мастере
     */
    async renderMasterDetail(masterId) {
        showLoading();
        
        try {
            const master = await this.api.getMaster(masterId);
            const services = await this.api.getMasterServices(masterId);
            
            this.state.currentMaster = master;
            this.state.services = services;
            
            const app = document.getElementById('app');
            
            app.innerHTML = `
                <div class="page">
                    <div class="header">
                        <button class="btn-back" data-back-route="/masters">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1>Мастер</h1>
                    </div>
                    
                    <div class="content">
                        <div class="master-detail-card">
                            <img src="${master.photo_url || '/assets/images/placeholder.jpg'}" alt="${master.name}" class="master-photo">
                            <h2>${master.name}</h2>
                            <p class="specialty">${master.specialty}</p>
                            <div class="master-stats">
                                <span>⭐ ${master.rating || '5.0'}</span>
                                <span>📅 ${master.experience} лет</span>
                            </div>
                        </div>
                        
                        ${master.description ? `
                            <div class="card">
                                <h3>О мастере</h3>
                                <p>${master.description}</p>
                            </div>
                        ` : ''}
                        
                        <div class="card">
                            <h3>Услуги</h3>
                            <div class="services-list">
                                ${services.map(service => `
                                    <div class="service-item">
                                        <div class="service-info">
                                            <h4>${service.name}</h4>
                                            ${service.description ? `<p>${service.description}</p>` : ''}
                                            <div class="service-meta">
                                                <span><i class="fas fa-clock"></i> ${service.duration} мин</span>
                                                <span class="price"><i class="fas fa-ruble-sign"></i> ${service.price} ₽</span>
                                            </div>
                                        </div>
                                        <button 
                                            class="btn btn-primary book-service-btn" 
                                            data-master-id="${masterId}" 
                                            data-service-id="${service.id}">
                                            Записаться
                                        </button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    ${this.renderBottomNav('masters')}
                </div>
            `;
            
            // ✅ ГЛАВНОЕ ИЗМЕНЕНИЕ: Добавляем обработчики для кнопок "Записаться"
            document.querySelectorAll('.book-service-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const masterId = parseInt(btn.getAttribute('data-master-id'));
                    const serviceId = parseInt(btn.getAttribute('data-service-id'));
                    
                    // Запускаем процесс бронирования через bookingFlow
                    if (window.bookingFlow) {
                        window.bookingFlow.start(masterId, serviceId);
                    } else {
                        console.error('bookingFlow не найден!');
                        showToast('Ошибка: модуль бронирования не загружен', 'error');
                    }
                });
            });
            
            // Обработчик кнопки "Назад"
            const backBtn = document.querySelector('.btn-back');
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    const route = backBtn.getAttribute('data-back-route');
                    router.navigate(route);
                });
            }
            
        } catch (error) {
            console.error('Ошибка загрузки мастера:', error);
            this.showErrorScreen('Не удалось загрузить информацию о мастере');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить мои записи
     */
    async renderMyBookings() {
        showLoading();
        
        try {
            const bookings = await this.api.getMyBookings();
            this.state.bookings = bookings;
            
            const app = document.getElementById('app');
            
            // Разделяем на предстоящие и завершенные
            const upcoming = bookings.filter(b => 
                b.status === 'confirmed' && new Date(`${b.date}T${b.time_start}`) > new Date()
            );
            const past = bookings.filter(b => 
                b.status === 'completed' || new Date(`${b.date}T${b.time_start}`) <= new Date()
            );
            
            app.innerHTML = `
                <div class="page">
                    <div class="header">
                        <h1>Мои записи</h1>
                    </div>
                    
                    <div class="content">
                        ${upcoming.length === 0 && past.length === 0 ? `
                            <div class="empty-state">
                                <i class="fas fa-calendar-times"></i>
                                <p>У вас пока нет записей</p>
                                <button class="btn btn-primary" data-nav-route="/masters">
                                    Записаться
                                </button>
                            </div>
                        ` : `
                            <div class="bookings-tabs">
                                <button class="tab active" data-tab="upcoming">
                                    Предстоящие (${upcoming.length})
                                </button>
                                <button class="tab" data-tab="past">
                                    Завершённые (${past.length})
                                </button>
                            </div>
                            
                            <div class="tab-content active" data-content="upcoming">
                                ${upcoming.length === 0 ? `
                                    <div class="empty-state">
                                        <p>Нет предстоящих записей</p>
                                    </div>
                                ` : `
                                    <div class="bookings-list">
                                        ${upcoming.map(booking => this.renderBookingCard(booking)).join('')}
                                    </div>
                                `}
                            </div>
                            
                            <div class="tab-content" data-content="past">
                                ${past.length === 0 ? `
                                    <div class="empty-state">
                                        <p>Нет завершённых записей</p>
                                    </div>
                                ` : `
                                    <div class="bookings-list">
    /**
     * Отрисовать карточку записи
     */
    renderBookingCard(booking) {
        const isFuture = new Date(`${booking.date}T${booking.time_start}`) > new Date();
        
        return `
            <div class="booking-card status-${booking.status}">
                <div class="booking-header">
                    <span class="booking-date">${formatDate(booking.date)}</span>
                    <span class="booking-status ${booking.status}">
                        ${this.getStatusText(booking.status)}
                    </span>
                </div>
                
                <div class="booking-info">
                    <div class="booking-info-row">
                        <span class="booking-info-icon"><i class="fas fa-user"></i></span>
                        <span class="booking-info-label">Мастер:</span>
                        <span class="booking-master-name">${booking.master?.name || 'Не указан'}</span>
                    </div>
                    <div class="booking-info-row">
                        <span class="booking-info-icon"><i class="fas fa-cut"></i></span>
                        <span class="booking-info-label">Услуга:</span>
                        <span class="booking-info-value">${booking.service?.name || 'Не указана'}</span>
                    </div>
                    <div class="booking-info-row">
                        <span class="booking-info-icon"><i class="fas fa-clock"></i></span>
                        <span class="booking-info-label">Время:</span>
                        <span class="booking-info-value">${booking.time_start} - ${booking.time_end}</span>
                    </div>
                    <div class="booking-info-row">
                        <span class="booking-info-icon"><i class="fas fa-ruble-sign"></i></span>
                        <span class="booking-info-label">Цена:</span>
                        <span class="booking-info-value">${booking.price} ₽</span>
                    </div>
                </div>
                
                ${isFuture && booking.status === 'confirmed' ? `
                    <div class="booking-actions">
                        <button class="btn-danger" onclick="window.app.cancelBooking(${booking.id})">
                            Отменить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
            
        } catch (error) {
            console.error('Ошибка загрузки записей:', error);
            this.showErrorScreen('Не удалось загрузить записи');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отрисовать карточку записи
     */
    renderBookingCard(booking) {
        const isFuture = new Date(`${booking.date}T${booking.time_start}`) > new Date();
        
        return `
            <div class="booking-card">
                <div class="booking-header">
                    <span class="booking-date">${formatDate(booking.date)}</span>
                    <span class="booking-status status-${booking.status}">
                        ${this.getStatusText(booking.status)}
                    </span>
                </div>
                
                <div class="booking-body">
                    <div class="booking-master">
                        <img src="${booking.master?.photo_url || '/assets/images/placeholder.jpg'}" alt="${booking.master?.name}">
                        <div>
                            <strong>${booking.master?.name || 'Мастер'}</strong>
                            <span>${booking.service?.name || 'Услуга'}</span>
                        </div>
                    </div>
                    
                    <div class="booking-details">
                        <span><i class="fas fa-clock"></i> ${booking.time_start} - ${booking.time_end}</span>
                        <span><i class="fas fa-ruble-sign"></i> ${booking.price} ₽</span>
                    </div>
                </div>
                
                ${isFuture && booking.status === 'confirmed' ? `
                    <div class="booking-actions">
                        <button class="btn btn-secondary btn-sm" data-booking-id="${booking.id}" data-action="cancel">
                            Отменить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Получить текст статуса
     */
    getStatusText(status) {
        const statusTexts = {
            'confirmed': 'Подтверждено',
            'completed': 'Завершено',
            'cancelled': 'Отменено',
            'no_show': 'Не пришёл'
        };
        return statusTexts[status] || status;
    }

    /**
     * Отменить бронирование
     */
    async cancelBooking(bookingId) {
        if (!confirm("Вы уверены что хотите отменить запись?")) {
            return;
        }
        
        try {
            showLoading();
            await this.api.cancelBooking(bookingId);
            showToast("Запись успешно отменена", "success");
            
            // Перезагружаем список записей
            await this.renderMyBookings();
            
        } catch (error) {
            console.error("Ошибка отмены записи:", error);
            showToast("Ошибка отмены записи", "error");
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить профиль
     */
    renderProfile() {
        const app = document.getElementById('app');
        const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
        
        app.innerHTML = `
            <div class="page">
                <div class="header">
                    <h1>Профиль</h1>
                </div>
                
                <div class="content">
                    <div class="card">
                        <h3>Информация</h3>
                        ${user ? `
                            <div class="profile-info">
                                <div class="info-row">
                                    <span>Имя:</span>
                                    <strong>${user.first_name || ''} ${user.last_name || ''}</strong>
                                </div>
                                <div class="info-row">
                                    <span>Username:</span>
                                    <strong>@${user.username || 'не указан'}</strong>
                                </div>
                            </div>
                        ` : `
                            <p>Откройте приложение через Telegram бота</p>
                        `}
                    </div>
                </div>
                
                ${this.renderBottomNav('profile')}
            </div>
        `;
    }
    
    /**
     * Отобразить нижнюю навигацию
     */
    renderBottomNav(active = '') {
        return `
            <nav class="bottom-nav">
                <div class="nav-item ${active === 'home' ? 'active' : ''}" data-route="/">
                    <i class="fas fa-home"></i>
                    <span>Главная</span>
                </div>
                <div class="nav-item ${active === 'masters' ? 'active' : ''}" data-route="/masters">
                    <i class="fas fa-users"></i>
                    <span>Мастера</span>
                </div>
                <div class="nav-item ${active === 'bookings' ? 'active' : ''}" data-route="/bookings">
                    <i class="fas fa-calendar-check"></i>
                    <span>Записи</span>
                </div>
                <div class="nav-item ${active === 'profile' ? 'active' : ''}" data-route="/profile">
                    <i class="fas fa-user"></i>
                    <span>Профиль</span>
                </div>
            </nav>
        `;
    }
    
    /**
     * Показать экран ошибки
     */
    showErrorScreen(message) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="error-screen">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2>Ошибка</h2>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Обновить страницу
                </button>
            </div>
        `;
    }
}

// Создаём глобальный экземпляр приложения
const app = new App();

// Делаем доступными глобально для использования из HTML
window.app = app;
window.router = router;

// Экспортируем для использования в других модулях
export { App };
