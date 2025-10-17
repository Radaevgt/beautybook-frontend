/**
 * Главное приложение BeautyBook
 */

class App {
    constructor() {
        this.salon = null;
        this.masters = [];
        this.services = [];
        this.categories = [];
        this.currentBooking = {};
        
        this.init();
    }
    
    /**
     * Инициализация приложения
     */
    async init() {
        console.log('🚀 Инициализация BeautyBook...');
        
        // Показываем лоадер
        this.showGlobalLoader();
        
        try {
            // Загружаем базовые данные
            await this.loadInitialData();
            
            // Настраиваем роуты
            this.setupRoutes();
            
            // Настраиваем навигацию
            this.setupNavigation();
            
            // Скрываем лоадер
            this.hideGlobalLoader();
            
            // Переходим на главную страницу
            router.navigate('home');
            
            console.log('✅ BeautyBook готов!');
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showGlobalError(error.message);
        }
    }
    
    /**
     * Загрузить начальные данные
     */
    async loadInitialData() {
        try {
            // Загружаем данные о салоне
            this.salon = await api.getSalon();
            
            // Загружаем категории услуг
            this.categories = await api.getServiceCategories();
            
            console.log('Данные загружены:', {
                salon: this.salon,
                categories: this.categories
            });
        } catch (error) {
            throw new Error('Не удалось загрузить данные: ' + error.message);
        }
    }
    
    /**
     * Настроить роуты
     */
    setupRoutes() {
        // Главная
        router.on('home', () => this.showHomePage());
        
        // Мастера
        router.on('masters', () => this.showMastersPage());
        router.on('master', (params) => this.showMasterPage(params.id));
        
        // Бронирование
        router.on('booking-service', (params) => this.showBookingServicePage(params));
        router.on('booking-date', () => this.showBookingDatePage());
        router.on('booking-time', () => this.showBookingTimePage());
        router.on('booking-contact', () => this.showBookingContactPage());
        router.on('booking-confirm', () => this.showBookingConfirmPage());
        
        // Мои записи
        router.on('bookings', () => this.showBookingsPage());
        
        // Профиль
        router.on('profile', () => this.showProfilePage());
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
                if (window.telegramApp) {
                    telegramApp.hapticFeedback('light');
                }
            }
        }
    });
}
    
    /**
     * Показать глобальный лоадер
     */
    showGlobalLoader() {
        document.getElementById('app').innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
                <div class="loading">
                    <div class="spinner"></div>
                    <p style="margin-top: 16px; color: var(--color-text-secondary);">Загрузка...</p>
                </div>
            </div>
        `;
    }
    
    /**
     * Скрыть глобальный лоадер
     */
    hideGlobalLoader() {
        // Контент уже будет заменён при рендеринге страниц
    }
    
    /**
     * Показать глобальную ошибку
     */
    showGlobalError(message) {
        document.getElementById('app').innerHTML = `
            <div style="padding: 32px;">
                <div class="alert alert-error">
                    <span class="alert-icon">⚠️</span>
                    <div class="alert-content">
                        <div class="alert-title">Ошибка</div>
                        <p>${message}</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // ============================================
    // СТРАНИЦЫ
    // ============================================
    
    /**
     * Главная страница
     */
    async showHomePage() {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <!-- Шапка -->
            <div class="header">
                <div class="header-content container">
                    <h1 class="header-title">${this.salon.name}</h1>
                </div>
            </div>
            
            <!-- Контент -->
            <div class="container section">
                <!-- Информация о салоне -->
                <div class="card mb-lg">
                    ${this.salon.logo_url ? `
                        <img src="${this.salon.logo_url}" alt="${this.salon.name}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 12px; margin-bottom: 16px;">
                    ` : ''}
                    
                    ${this.salon.description ? `
                        <p class="text-secondary mb-md">${this.salon.description}</p>
                    ` : ''}
                    
                    <div class="flex flex-col gap-sm">
                        <div class="flex items-center gap-sm">
                            <span>📍</span>
                            <span>${this.salon.address}</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <span>📞</span>
                            <a href="tel:${this.salon.phone}">${Utils.formatPhone(this.salon.phone)}</a>
                        </div>
                        ${this.salon.working_hours ? `
                            <div class="flex items-center gap-sm">
                                <span>🕐</span>
                                <span>${this.salon.working_hours}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Кнопка записи -->
                <button class="btn btn-primary btn-lg btn-block" onclick="router.navigate('masters')">
                    📅 Записаться на услугу
                </button>
                
                <!-- Быстрые действия -->
                <div class="grid grid-cols-2 gap-md mt-lg">
                    <div class="card text-center" onclick="router.navigate('masters')" style="cursor: pointer;">
                        <div style="font-size: 32px; margin-bottom: 8px;">👨‍💼</div>
                        <div class="font-semibold">Наши мастера</div>
                    </div>
                    <div class="card text-center" onclick="router.navigate('bookings')" style="cursor: pointer;">
                        <div style="font-size: 32px; margin-bottom: 8px;">📋</div>
                        <div class="font-semibold">Мои записи</div>
                    </div>
                </div>
            </div>
            
            <!-- Нижняя навигация -->
            ${this.renderBottomNav()}
        `;
    }
    
    /**
     * Страница со списком мастеров
     */
    async showMastersPage() {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <h1 class="header-title">Наши мастера</h1>
                </div>
            </div>
            
            <div class="container section">
                <div id="masters-list"></div>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        const listContainer = document.getElementById('masters-list');
        Utils.showLoader(listContainer);
        
        try {
            this.masters = await api.getMasters();
            
            if (this.masters.length === 0) {
                Utils.showEmptyState(listContainer, 'Мастера не найдены', '👨‍💼');
                return;
            }
            
            listContainer.innerHTML = `
                <div class="grid gap-md">
                    ${this.masters.map(master => this.renderMasterCard(master)).join('')}
                </div>
            `;
            
            // Добавляем обработчики кликов
            this.masters.forEach(master => {
                document.getElementById(`master-${master.id}`)?.addEventListener('click', () => {
                    router.navigate('master', { id: master.id });
                    telegramApp.hapticFeedback('light');
                });
            });
            
        } catch (error) {
            Utils.showError(listContainer, error.message);
        }
    }
    
    /**
     * Страница мастера
     */
    async showMasterPage(masterId) {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <button class="header-back" onclick="router.navigate('masters')">←</button>
                    <h1 class="header-title">Мастер</h1>
                </div>
            </div>
            
            <div class="container section">
                <div id="master-details"></div>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        const detailsContainer = document.getElementById('master-details');
        Utils.showLoader(detailsContainer);
        
        try {
            const master = await api.getMaster(masterId);
            const services = await api.getMasterServices(masterId);
            
            detailsContainer.innerHTML = `
                <!-- Фото и основная информация -->
                <div class="card mb-lg">
                    <img src="${master.photo_url}" alt="${master.name}" class="master-photo mb-md">
                    
                    <h2 class="mb-xs">${master.name}</h2>
                    <p class="text-secondary mb-sm">${master.specialty}</p>
                    
                    <div class="master-stats mb-md">
                        <div class="master-rating">
                            ${Utils.generateStars(Math.round(master.rating))}
                            <span class="rating-value">${master.rating.toFixed(1)}</span>
                            <span class="rating-count">(${master.reviews_count})</span>
                        </div>
                        <div class="master-experience">
                            ${master.experience} ${Utils.pluralize(master.experience, ['год', 'года', 'лет'])} опыта
                        </div>
                    </div>
                    
                    ${master.description ? `
                        <div class="divider"></div>
                        <h3>О мастере</h3>
                        <p class="text-secondary">${master.description}</p>
                    ` : ''}
                    
                    ${master.education && master.education.length > 0 ? `
                        <div class="divider"></div>
                        <h3>Образование</h3>
                        <ul style="list-style: disc; padding-left: 20px; color: var(--color-text-secondary);">
                            ${master.education.map(edu => `<li>${edu}</li>`).join('')}
                        </ul>
                    ` : ''}
                    
                    ${master.portfolio && master.portfolio.length > 0 ? `
                        <div class="divider"></div>
                        <h3>Портфолио</h3>
                        <div class="gallery">
                            ${master.portfolio.map(photo => `
                                <div class="gallery-item">
                                    <img src="${photo}" alt="Работа мастера">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Услуги -->
                <h3 class="mb-md">Услуги мастера</h3>
                <div class="grid gap-md">
                    ${services.map(service => this.renderServiceCard(service, master)).join('')}
                </div>
            `;
            
            // Добавляем обработчики для услуг
            services.forEach(service => {
                document.getElementById(`service-${service.id}`)?.addEventListener('click', () => {
                    this.currentBooking = {
                        master: master,
                        service: service
                    };
                    router.navigate('booking-date');
                    telegramApp.hapticFeedback('medium');
                });
            });
            
        } catch (error) {
            Utils.showError(detailsContainer, error.message);
        }
    }
    
    /**
     * Страница выбора даты
     */
    async showBookingDatePage() {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <button class="header-back" onclick="router.back()">←</button>
                    <h1 class="header-title">Выберите дату</h1>
                </div>
            </div>
            
            <div class="container section">
                <div id="calendar-container"></div>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        // Здесь будет календарь (создадим в следующем файле)
        document.getElementById('calendar-container').innerHTML = `
            <div class="card">
                <p class="text-center text-secondary">Календарь будет здесь</p>
                <button class="btn btn-primary btn-block mt-md" onclick="app.selectDate('2025-10-20')">
                    Выбрать дату (тест)
                </button>
            </div>
        `;
    }
    
    /**
     * Выбрать дату (временный метод)
     */
    selectDate(date) {
        this.currentBooking.date = date;
        router.navigate('booking-time');
    }
    
    /**
     * Страница выбора времени
     */
    async showBookingTimePage() {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <button class="header-back" onclick="router.back()">←</button>
                    <h1 class="header-title">Выберите время</h1>
                </div>
            </div>
            
            <div class="container section">
                <div id="time-slots-container"></div>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        const slotsContainer = document.getElementById('time-slots-container');
        Utils.showLoader(slotsContainer);
        
        try {
            const schedule = await api.getSchedule(
                this.currentBooking.master.id,
                this.currentBooking.date
            );
            
            if (schedule.available_slots.length === 0) {
                Utils.showEmptyState(slotsContainer, 'На выбранную дату нет свободных слотов', '⏰');
                return;
            }
            
            slotsContainer.innerHTML = `
                <div class="card mb-md">
                    <p class="text-center text-secondary mb-sm">
                        ${Utils.formatDate(this.currentBooking.date)}
                    </p>
                    <p class="text-center font-semibold">
                        ${this.currentBooking.master.name}
                    </p>
                </div>
                
                <div class="time-slots">
                    ${schedule.available_slots.map(time => `
                        <div class="time-slot" onclick="app.selectTime('${time}')">
                            ${time}
                        </div>
                    `).join('')}
                </div>
            `;
            
        } catch (error) {
            Utils.showError(slotsContainer, error.message);
        }
    }
    
    /**
     * Выбрать время
     */
    selectTime(time) {
        this.currentBooking.time = time;
        router.navigate('booking-contact');
        telegramApp.hapticFeedback('medium');
    }
    
    /**
     * Страница контактных данных
     */
    showBookingContactPage() {
        const user = telegramApp.getUser();
        
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <button class="header-back" onclick="router.back()">←</button>
                    <h1 class="header-title">Контактные данные</h1>
                </div>
            </div>
            
            <div class="container section">
                <form id="contact-form" class="card">
                    <div class="form-group">
                        <label class="form-label">Ваше имя *</label>
                        <input type="text" class="input" id="client-name" 
                               value="${user?.first_name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Телефон *</label>
                        <input type="tel" class="input" id="client-phone" 
                               placeholder="+7 (___) ___-__-__" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Комментарий (необязательно)</label>
                        <textarea class="input" id="client-comment" 
                                  rows="3" placeholder="Дополнительные пожелания..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-lg btn-block">
                        Продолжить
                    </button>
                </form>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitContactForm();
        });
    }
    
    /**
     * Отправить форму контактов
     */
    submitContactForm() {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const comment = document.getElementById('client-comment').value.trim();
        
        if (!name || !phone) {
            telegramApp.showAlert('Заполните все обязательные поля');
            return;
        }
        
        if (!Utils.isValidPhone(phone)) {
            telegramApp.showAlert('Неверный формат телефона');
            return;
        }
        
        this.currentBooking.clientName = name;
        this.currentBooking.clientPhone = phone;
        this.currentBooking.comment = comment;
        
        router.navigate('booking-confirm');
        telegramApp.hapticFeedback('medium');
    }
    
    /**
     * Страница подтверждения записи
     */
    showBookingConfirmPage() {
        const { master, service, date, time, clientName, clientPhone, comment } = this.currentBooking;
        
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <button class="header-back" onclick="router.back()">←</button>
                    <h1 class="header-title">Подтверждение</h1>
                </div>
            </div>
            
            <div class="container section">
                <div class="card mb-md">
                    <h3 class="mb-md">Проверьте данные</h3>
                    
                    <div class="booking-details">
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Мастер:</span>
                            <span class="booking-detail-value">${master.name}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Услуга:</span>
                            <span class="booking-detail-value">${service.name}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Дата:</span>
                            <span class="booking-detail-value">${Utils.formatDate(date)}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Время:</span>
                            <span class="booking-detail-value">${time}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Длительность:</span>
                            <span class="booking-detail-value">${Utils.formatDuration(service.duration)}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Стоимость:</span>
                            <span class="booking-detail-value">${Utils.formatPrice(service.price)}</span>
                        </div>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="booking-details">
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Имя:</span>
                            <span class="booking-detail-value">${clientName}</span>
                        </div>
                        <div class="booking-detail-row">
                            <span class="booking-detail-label">Телефон:</span>
                            <span class="booking-detail-value">${Utils.formatPhone(clientPhone)}</span>
                        </div>
                        ${comment ? `
                            <div class="booking-detail-row">
                                <span class="booking-detail-label">Комментарий:</span>
                                <span class="booking-detail-value">${comment}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <button class="btn btn-primary btn-lg btn-block" id="confirm-booking-btn">
                    ✅ Подтвердить запись
                </button>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        document.getElementById('confirm-booking-btn').addEventListener('click', () => {
            this.confirmBooking();
        });
    }
    
    /**
     * Подтвердить запись
     */
    async confirmBooking() {
        const btn = document.getElementById('confirm-booking-btn');
        btn.disabled = true;
        btn.textContent = 'Создание записи...';
        
        try {
            const bookingData = {
                master_id: this.currentBooking.master.id,
                service_id: this.currentBooking.service.id,
                date: this.currentBooking.date,
                time_start: this.currentBooking.time,
                client_name: this.currentBooking.clientName,
                client_phone: this.currentBooking.clientPhone,
                comment: this.currentBooking.comment || null
            };
            
            await api.createBooking(bookingData);
            
            telegramApp.showAlert('✅ Запись успешно создана!');
            telegramApp.hapticFeedback('success');
            
            // Очищаем данные бронирования
            this.currentBooking = {};
            
            // Переходим на страницу записей
            router.navigate('bookings');
            
        } catch (error) {
            btn.disabled = false;
            btn.textContent = '✅ Подтвердить запись';
            telegramApp.showAlert('Ошибка: ' + error.message);
            telegramApp.hapticFeedback('error');
        }
    }
    
    /**
     * Страница "Мои записи"
     */
    async showBookingsPage() {
        const container = document.getElementById('app');
        
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <h1 class="header-title">Мои записи</h1>
                </div>
            </div>
            
            <div class="container section">
                <div id="bookings-list"></div>
            </div>
            
            ${this.renderBottomNav()}
        `;
        
        const listContainer = document.getElementById('bookings-list');
        Utils.showLoader(listContainer);
        
        try {
            const bookings = await api.getMyBookings();
            
            if (bookings.length === 0) {
                Utils.showEmptyState(listContainer, 'У вас пока нет записей', '📅');
                return;
            }
            
            listContainer.innerHTML = bookings.map(booking => this.renderBookingCard(booking)).join('');
            
        } catch (error) {
            Utils.showError(listContainer, error.message);
        }
    }
    
    /**
     * Страница профиля
     */
    showProfilePage() {
        const user = telegramApp.getUser();
        
        const container = document.getElementById('app');
        container.innerHTML = `
            <div class="header">
                <div class="header-content container">
                    <h1 class="header-title">Профиль</h1>
                </div>
            </div>
            
            <div class="container section">
                <div class="card text-center">
                    ${user?.photo_url ? `
                        <img src="${user.photo_url}" alt="${user.first_name}" class="avatar avatar-xl" style="margin: 0 auto 16px;">
                    ` : `
                        <div class="avatar avatar-xl" style="margin: 0 auto 16px; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 48px;">
                            ${user?.first_name?.[0] || '?'}
                        </div>
                    `}
                    
                    <h2>${user?.first_name || 'Пользователь'} ${user?.last_name || ''}</h2>
                    ${user?.username ? `<p class="text-secondary">@${user.username}</p>` : ''}
                </div>
            </div>
            
            ${this.renderBottomNav()}
        `;
    }
    
    // ============================================
    // РЕНДЕР КОМПОНЕНТОВ
    // ============================================
    
    renderMasterCard(master) {
        return `
            <div class="master-card" id="master-${master.id}">
                <img src="${master.photo_url}" alt="${master.name}" class="master-photo">
                <div class="master-info">
                    <div class="master-name">${master.name}</div>
                    <div class="master-specialty">${master.specialty}</div>
                    <div class="master-stats">
                        <div class="master-rating">
                            ${Utils.generateStars(Math.round(master.rating))}
                            <span class="rating-value">${master.rating.toFixed(1)}</span>
                        </div>
                        <div class="master-experience">
                            ${master.experience} ${Utils.pluralize(master.experience, ['год', 'года', 'лет'])}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderServiceCard(service, master) {
        return `
            <div class="service-card" id="service-${service.id}">
                <div class="service-header">
                    <div class="service-name">${service.name}</div>
                    <div class="service-price">${Utils.formatPrice(service.price)}</div>
                </div>
                ${service.description ? `
                    <div class="service-description">${service.description}</div>
                ` : ''}
                <div class="service-duration">
                    <span>⏱️</span>
                    <span>${Utils.formatDuration(service.duration)}</span>
                </div>
            </div>
        `;
    }
    
    renderBookingCard(booking) {
        return `
            <div class="booking-card">
                <div class="booking-header">
                    <div class="booking-master-info">
                        <div class="booking-master-name">${booking.client_name}</div>
                        <div class="booking-service">Запись #${booking.id}</div>
                    </div>
                    <span class="badge ${Utils.getStatusClass(booking.status)}">
                        ${Utils.getStatusText(booking.status)}
                    </span>
                </div>
                
                <div class="booking-details">
                    <div class="booking-detail-row">
                        <span class="booking-detail-label">Дата:</span>
                        <span class="booking-detail-value">${Utils.formatDate(booking.date)}</span>
                    </div>
                    <div class="booking-detail-row">
                        <span class="booking-detail-label">Время:</span>
                        <span class="booking-detail-value">${Utils.formatTime(booking.time_start)}</span>
                    </div>
                    <div class="booking-detail-row">
                        <span class="booking-detail-label">Стоимость:</span>
                        <span class="booking-detail-value">${Utils.formatPrice(booking.price)}</span>
                    </div>
                </div>
                
                ${booking.status === 'confirmed' ? `
                    <div class="booking-actions">
                        <button class="btn btn-secondary btn-sm" onclick="app.cancelBooking(${booking.id})">
                            Отменить
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    renderBottomNav() {
        return `
            <nav class="bottom-nav">
                <a href="#" class="nav-item" data-route="home">
                    <span class="nav-icon">🏠</span>
                    <span class="nav-label">Главная</span>
                </a>
                <a href="#" class="nav-item" data-route="masters">
                    <span class="nav-icon">👨‍💼</span>
                    <span class="nav-label">Мастера</span>
                </a>
                <a href="#" class="nav-item" data-route="bookings">
                    <span class="nav-icon">📅</span>
                    <span class="nav-label">Записи</span>
                </a>
                <a href="#" class="nav-item" data-route="profile">
                    <span class="nav-icon">👤</span>
                    <span class="nav-label">Профиль</span>
                </a>
            </nav>
        `;
    }
    
    /**
     * Отменить запись
     */
    async cancelBooking(bookingId) {
        telegramApp.showConfirm('Вы уверены, что хотите отменить запись?', async (confirmed) => {
            if (!confirmed) return;
            
            try {
                await api.cancelBooking(bookingId);
                telegramApp.showAlert('Запись успешно отменена');
                telegramApp.hapticFeedback('success');
                
                // Обновляем список
                this.showBookingsPage();
            } catch (error) {
                telegramApp.showAlert('Ошибка: ' + error.message);
                telegramApp.hapticFeedback('error');
            }
        });
    }
}

// Создаём экземпляр приложения при загрузке
let app;
window.addEventListener('DOMContentLoaded', () => {
    app = new App();
});