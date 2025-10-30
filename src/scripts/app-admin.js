/**
 * BeautyBook Admin App
 * Главное приложение для администраторов
 */

import { API } from './api.js';
import { showToast } from './utils.js';

// Импорт модулей админки
import { AdminDashboard } from './admin-dashboard.js';
import { AdminBookings } from './admin-bookings.js';
import { AdminMasters } from './admin-masters.js';
import { AdminServices } from './admin-services.js';
import { AdminClients } from './admin-clients.js';
import { AdminReviews } from './admin-reviews.js';
import { AdminStats } from './admin-stats.js';

class AdminApp {
    constructor() {
        this.api = new API();
        this.currentPage = 'dashboard';
        this.isAdmin = false;
        this.adminData = null;
        
        // Инициализация модулей
        this.dashboard = new AdminDashboard(this.api);
        this.bookings = new AdminBookings(this.api);
        this.masters = new AdminMasters(this.api);
        this.services = new AdminServices(this.api);
        this.clients = new AdminClients(this.api);
        this.reviews = new AdminReviews(this.api);
        this.stats = new AdminStats(this.api);
    }

    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🔧 Инициализация админ-панели...');

        // Инициализация Telegram Web App
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.ready();
            window.Telegram.WebApp.expand();
            
            // Применяем тему Telegram
            this.applyTelegramTheme();
            
            // Настройка кнопки "Назад"
            window.Telegram.WebApp.BackButton.onClick(() => {
                this.handleBack();
            });
        }

        // Проверка прав администратора
        await this.checkAdminAccess();

        if (!this.isAdmin) {
            this.showAccessDenied();
            return;
        }

        // Настройка навигации
        this.setupNavigation();

        // Загрузка начальной страницы
        await this.navigateTo('dashboard');

        console.log('✅ Админ-панель готова');
    }

    /**
     * Проверка прав администратора
     */
    async checkAdminAccess() {
        try {
            // Получаем данные пользователя из Telegram
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            
            if (!tgUser) {
                console.warn('⚠️ Нет данных пользователя Telegram');
                this.isAdmin = false;
                return;
            }

            console.log('👤 Пользователь:', tgUser);

            // Проверяем права через API
            // В реальности API должен проверить telegram_id в таблице admins
            // Для разработки - проверяем локально
            
            // TODO: Раскомментируйте когда настроите таблицу admins в БД
            /*
            const response = await this.api.request('/api/admin/check-access', {
                method: 'GET'
            });
            this.isAdmin = response.is_admin;
            */

            // Временная заглушка для разработки
            // ВАЖНО: Замените на реальную проверку!
            const ADMIN_IDS = [750518960];
            this.isAdmin = ADMIN_IDS.includes(tgUser.id) || ADMIN_IDS.length === 0;
            
            if (this.isAdmin) {
                this.adminData = tgUser;
                console.log('✅ Пользователь является администратором');
            } else {
                console.warn('❌ Пользователь НЕ является администратором');
            }

        } catch (error) {
            console.error('Ошибка проверки прав:', error);
            this.isAdmin = false;
        }
    }

    /**
     * Показать сообщение об отказе в доступе
     */
    showAccessDenied() {
        const html = `
            <div class="access-denied">
                <div class="access-denied-icon">
                    <i class="fas fa-lock"></i>
                </div>
                <h2>Доступ запрещён</h2>
                <p>Для доступа к админ-панели требуются права администратора.</p>
                <p class="access-denied-hint">
                    Если вы являетесь администратором, обратитесь к владельцу для получения доступа.
                </p>
            </div>
        `;
        
        document.getElementById('app').innerHTML = html;
    }

    /**
     * Настройка навигации
     */
    setupNavigation() {
        const nav = document.getElementById('admin-nav');
        nav.style.display = 'flex';

        const navItems = nav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateTo(page);
            });
        });
    }

    /**
     * Навигация между страницами
     */
    async navigateTo(page) {
        console.log(`📄 Навигация: ${page}`);

        // Обновляем активную кнопку навигации
        this.updateActiveNav(page);

        // Показываем/скрываем кнопку "Назад"
        if (page === 'dashboard') {
            window.Telegram?.WebApp?.BackButton.hide();
        } else {
            window.Telegram?.WebApp?.BackButton.show();
        }

        // Отображаем соответствующую страницу
        switch (page) {
            case 'dashboard':
                await this.dashboard.render();
                break;
            
            case 'bookings':
                await this.bookings.render();
                break;
            
            case 'masters':
                await this.masters.render();
                break;
            
            case 'services':
                await this.services.render();
                break;
            
            case 'clients':
                await this.clients.render();
                break;
            
            case 'reviews':
                await this.reviews.render();
                break;
            
            case 'stats':
                await this.stats.render();
                break;
            
            case 'more':
                this.showMoreMenu();
                break;
            
            default:
                console.warn('Неизвестная страница:', page);
        }

        this.currentPage = page;
    }

    /**
     * Обновить активную кнопку навигации
     */
    updateActiveNav(page) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Показать меню "Ещё"
     */
    showMoreMenu() {
        const html = `
            <div class="more-menu">
                <h2>Дополнительно</h2>
                
                <div class="more-menu-section">
                    <h3>Управление</h3>
                    <button class="more-menu-item" onclick="adminApp.navigateTo('clients')">
                        <i class="fas fa-users"></i>
                        <span>CRM Клиентов</span>
                    </button>
                    <button class="more-menu-item" onclick="adminApp.navigateTo('reviews')">
                        <i class="fas fa-star"></i>
                        <span>Модерация отзывов</span>
                    </button>
                    <button class="more-menu-item" onclick="adminApp.navigateTo('stats')">
                        <i class="fas fa-chart-bar"></i>
                        <span>Статистика</span>
                    </button>
                </div>

                <div class="more-menu-section">
                    <h3>Настройки</h3>
                    <button class="more-menu-item" onclick="adminApp.showSalonSettings()">
                        <i class="fas fa-cog"></i>
                        <span>Настройки салона</span>
                    </button>
                    <button class="more-menu-item" onclick="adminApp.showNotificationSettings()">
                        <i class="fas fa-bell"></i>
                        <span>Уведомления</span>
                    </button>
                </div>

                <div class="more-menu-section">
                    <h3>Информация</h3>
                    <button class="more-menu-item" onclick="adminApp.showHelp()">
                        <i class="fas fa-question-circle"></i>
                        <span>Справка</span>
                    </button>
                    <button class="more-menu-item" onclick="adminApp.showAbout()">
                        <i class="fas fa-info-circle"></i>
                        <span>О приложении</span>
                    </button>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }

    /**
     * Обработка кнопки "Назад"
     */
    handleBack() {
        // Возвращаемся на главную
        this.navigateTo('dashboard');
    }

    /**
     * Применить тему Telegram
     */
    applyTelegramTheme() {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        // Применяем цвета темы
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.backgroundColor || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.textColor || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.hintColor || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.linkColor || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.buttonColor || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.buttonTextColor || '#ffffff');
    }

    /**
     * Показать настройки салона
     */
    async showSalonSettings() {
        showToast('Настройки салона (в разработке)', 'info');
        // TODO: Реализовать настройки салона
    }

    /**
     * Показать настройки уведомлений
     */
    async showNotificationSettings() {
        showToast('Настройки уведомлений (в разработке)', 'info');
        // TODO: Реализовать настройки уведомлений
    }

    /**
     * Показать справку
     */
    showHelp() {
        const html = `
            <div class="help-page">
                <h2>Справка по админ-панели</h2>
                
                <div class="help-section">
                    <h3><i class="fas fa-chart-line"></i> Главная</h3>
                    <p>Дашборд с основной статистикой и быстрым доступом к важным разделам.</p>
                </div>

                <div class="help-section">
                    <h3><i class="fas fa-calendar-check"></i> Записи</h3>
                    <p>Управление записями клиентов: создание, редактирование, изменение статуса.</p>
                </div>

                <div class="help-section">
                    <h3><i class="fas fa-user-tie"></i> Мастера</h3>
                    <p>Добавление и редактирование мастеров, назначение услуг, управление графиком.</p>
                </div>

                <div class="help-section">
                    <h3><i class="fas fa-scissors"></i> Услуги</h3>
                    <p>Управление услугами и категориями, установка цен и длительности.</p>
                </div>

                <div class="help-section">
                    <h3><i class="fas fa-users"></i> CRM</h3>
                    <p>База клиентов с историей визитов и статистикой.</p>
                </div>

                <div class="help-section">
                    <h3><i class="fas fa-star"></i> Отзывы</h3>
                    <p>Модерация отзывов клиентов, публикация и ответы.</p>
                </div>

                <button class="btn-primary" onclick="adminApp.navigateTo('dashboard')">
                    Вернуться на главную
                </button>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }

    /**
     * Показать информацию о приложении
     */
    showAbout() {
        const html = `
            <div class="about-page">
                <div class="about-logo">
                    <i class="fas fa-spa"></i>
                </div>
                <h2>BeautyBook Admin</h2>
                <p class="about-version">Версия 1.0.0</p>
                
                <div class="about-info">
                    <p>Система управления салоном красоты</p>
                    <p>Администраторская панель для Telegram Mini App</p>
                </div>

                <div class="about-features">
                    <h3>Возможности:</h3>
                    <ul>
                        <li>Управление записями</li>
                        <li>CRM клиентов</li>
                        <li>Управление мастерами и услугами</li>
                        <li>Модерация отзывов</li>
                        <li>Статистика и аналитика</li>
                    </ul>
                </div>

                <button class="btn-primary" onclick="adminApp.navigateTo('dashboard')">
                    Вернуться на главную
                </button>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }
}

// Создаём глобальный экземпляр приложения
window.adminApp = new AdminApp();

// Запускаем приложение
window.adminApp.init();

console.log('✅ AdminApp загружен');
