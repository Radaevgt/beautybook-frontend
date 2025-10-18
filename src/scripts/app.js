/**
 * Главный файл приложения BeautyBook
 */

import { API } from './api.js';
import { router } from './router.js';
import { telegramApp } from './telegram.js';
import { showLoading, hideLoading, formatDate, formatTime } from './utils.js';

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
            
            // Загружаем категории услуг
            const categories = await this.api.getServiceCategories();
            
            // Сохраняем в состояние
            this.state.salon = salon;
            this.state.categories = categories;
            
            console.log('Данные загружены:', { salon, categories });
            
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
        
        // Бронирование
        router.on('/booking/:masterId/:serviceId', (params) => {
            this.renderBooking(params.masterId, params.serviceId);
        });
        
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
        // Используем делегирование событий
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const route = navItem.getAttribute('data-route');
                if (route) {
                    router.navigate(route);
                    if (window.Telegram?.WebApp) {
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
                                <div class="master-card" onclick="router.navigate('/masters/${master.id}')">
                                    <img src="${master.photo_url || '/assets/images/placeholder.jpg'}" alt="${master.name}">
                                    <div class="master-info">
                                        <h3>${master.name}</h3>
                                        <p class="specialty">${master.specialty}</p>
                                        <div class="master-stats">
                                            <span>⭐ ${master.rating || '5.0'}</span>
                                            <span>📅 ${master.experience} лет опыта</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    ${this.renderBottomNav('masters')}
                </div>
            `;
            
        } catch (error) {
            console.error('Ошибка загрузки мастеров:', error);
            this.showErrorScreen('Не удалось загрузить мастеров');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить детали мастера
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
                        <button class="btn-back" onclick="router.navigate('/masters')">←</button>
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
                                            <p>${service.description || ''}</p>
                                            <div class="service-meta">
                                                <span>⏱ ${service.duration} мин</span>
                                                <span class="price">${service.price} ₽</span>
                                            </div>
                                        </div>
                                        <button class="btn btn-primary" onclick="router.navigate('/booking/${masterId}/${service.id}')">
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
            
        } catch (error) {
            console.error('Ошибка загрузки мастера:', error);
            this.showErrorScreen('Не удалось загрузить информацию о мастере');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить процесс бронирования
     */
    async renderBooking(masterId, serviceId) {
        showLoading();
        
        try {
            const master = await this.api.getMaster(masterId);
            const service = await this.api.getService(serviceId);
            
            const app = document.getElementById('app');
            
            app.innerHTML = `
                <div class="page">
                    <div class="header">
                        <button class="btn-back" onclick="router.navigate('/masters/${masterId}')">←</button>
                        <h1>Запись</h1>
                    </div>
                    
                    <div class="content">
                        <div class="card">
                            <h3>Выбрано</h3>
                            <p><strong>Мастер:</strong> ${master.name}</p>
                            <p><strong>Услуга:</strong> ${service.name}</p>
                            <p><strong>Длительность:</strong> ${service.duration} мин</p>
                            <p><strong>Стоимость:</strong> ${service.price} ₽</p>
                        </div>
                        
                        <div class="card">
                            <p style="text-align: center; color: #666;">
                                Функционал бронирования в разработке
                            </p>
                        </div>
                    </div>
                    
                    ${this.renderBottomNav()}
                </div>
            `;
            
        } catch (error) {
            console.error('Ошибка:', error);
            this.showErrorScreen('Ошибка загрузки');
        } finally {
            hideLoading();
        }
    }
    
    /**
     * Отобразить мои записи
     */
    async renderMyBookings() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="page">
                <div class="header">
                    <h1>Мои записи</h1>
                </div>
                
                <div class="content">
                    <div class="card">
                        <p style="text-align: center; color: #666;">
                            У вас пока нет записей
                        </p>
                    </div>
                </div>
                
                ${this.renderBottomNav('bookings')}
            </div>
        `;
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
                            <p><strong>Имя:</strong> ${user.first_name || ''} ${user.last_name || ''}</p>
                            <p><strong>Username:</strong> @${user.username || 'не указан'}</p>
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
                    <span class="icon">🏠</span>
                    <span>Главная</span>
                </div>
                <div class="nav-item ${active === 'masters' ? 'active' : ''}" data-route="/masters">
                    <span class="icon">👨‍💼</span>
                    <span>Мастера</span>
                </div>
                <div class="nav-item ${active === 'bookings' ? 'active' : ''}" data-route="/bookings">
                    <span class="icon">📅</span>
                    <span>Записи</span>
                </div>
                <div class="nav-item ${active === 'profile' ? 'active' : ''}" data-route="/profile">
                    <span class="icon">👤</span>
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
                <div class="error-icon">⚠️</div>
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
window.app = new App();

// Экспортируем для использования в других модулях
export { App };
