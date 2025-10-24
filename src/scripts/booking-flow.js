/**
 * Модуль процесса бронирования
 * Управляет всеми шагами записи клиента
 */

import { API } from './api.js';
import { formatDate, formatTime, showToast } from './utils.js';

export class BookingFlow {
    constructor() {
        this.api = new API();
        this.currentStep = 1;
        this.bookingData = {
            master: null,
            service: null,
            date: null,
            time: null,
            clientName: '',
            clientPhone: '',
            comment: ''
        };
    }

    /**
     * Начать процесс бронирования
     */
    async start(masterId, serviceId) {
        try {
            // Загружаем данные мастера и услуги
            const [master, service] = await Promise.all([
                this.api.getMaster(masterId),
                this.api.getService(serviceId)
            ]);

            this.bookingData.master = master;
            this.bookingData.service = service;
            this.currentStep = 1;

            this.renderStep1();
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            showToast('Ошибка загрузки данных', 'error');
        }
    }

    /**
     * ШАГ 1: Подтверждение выбора услуги
     */
    renderStep1() {
        const { master, service } = this.bookingData;

        const html = `
            <div class="booking-step" data-step="1">
                <div class="page-header">
                    <button class="back-btn" onclick="history.back()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Подтверждение выбора</h2>
                    <div class="step-indicator">Шаг 1 из 4</div>
                </div>

                <div class="page-container">
                    <div class="master-card-mini">
                        <img src="${master.photo_url}" alt="${master.name}">
                        <div>
                            <h3>${master.name}</h3>
                            <p class="specialty">${master.specialty}</p>
                        </div>
                    </div>

                    <div class="service-card">
                        <h4>${service.name}</h4>
                        <div class="service-meta">
                            <span class="service-duration">
                                <i class="fas fa-clock"></i> ${service.duration} мин
                            </span>
                            <span class="service-price">
                                ${service.price} ₽
                            </span>
                        </div>
                    </div>
                </div>

                <div class="booking-actions">
                    <button class="booking-action-btn" onclick="bookingFlow.nextStep()">
                        Выбрать дату и время
                    </button>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }

    /**
     * ШАГ 2: Выбор даты
     */
    renderStep2() {
        const html = `
            <div class="booking-step" data-step="2">
                <div class="page-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Выберите дату</h2>
                    <div class="step-indicator">Шаг 2 из 4</div>
                </div>

                <div id="calendar-container" class="page-container">
                    ${this.renderCalendar()}
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }

    /**
     * Отрисовка календаря (следующие 30 дней)
     */
    renderCalendar() {
        const today = new Date();
        const calendar = [];

        // Генерируем следующие 30 дней
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' });
            const dayNum = date.getDate();
            const month = date.toLocaleDateString('ru-RU', { month: 'short' });
            const dateStr = date.toISOString().split('T')[0];
            
            const isToday = i === 0;
            const isSelected = this.bookingData.date === dateStr;

            calendar.push(`
                <div class="calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" 
                     data-date="${dateStr}"
                     onclick="bookingFlow.selectDate('${dateStr}')">
                    <div class="day-name">${dayOfWeek}</div>
                    <div class="day-num">${dayNum}</div>
                    <div class="day-month">${month}</div>
                </div>
            `);
        }

        return `
            <div class="calendar-grid">
                ${calendar.join('')}
            </div>
        `;
    }

    /**
     * Выбор даты
     */
    async selectDate(dateStr) {
        this.bookingData.date = dateStr;

        // Обновляем выделение
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelector(`[data-date="${dateStr}"]`).classList.add('selected');

        // Переходим к выбору времени
        setTimeout(() => this.nextStep(), 300);
    }

    /**
     * ШАГ 3: Выбор времени
     */
    async renderStep3() {
        const { master, service, date } = this.bookingData;

        const html = `
            <div class="booking-step" data-step="3">
                <div class="page-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Выберите время</h2>
                    <div class="step-indicator">Шаг 3 из 4</div>
                </div>

                <div class="page-container">
                    <div class="selected-date">
                        <i class="fas fa-calendar"></i>
                        ${formatDate(date)}
                    </div>

                    <div id="time-slots-container">
                        <div class="loading-spinner">
                            <div class="spinner"></div>
                            Загрузка доступного времени...
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        // Загружаем доступные слоты
        await this.loadTimeSlots();
    }

    /**
     * Загрузка доступных временных слотов
     */
    async loadTimeSlots() {
        try {
            const { master, service, date } = this.bookingData;
            
            const response = await this.api.getAvailableSlots(master.id, date, service.id);
            const slots = response.available_slots;

            if (slots.length === 0) {
                document.getElementById('time-slots-container').innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>На эту дату нет свободного времени</p>
                        <button class="btn-secondary" onclick="bookingFlow.prevStep()">
                            Выбрать другую дату
                        </button>
                    </div>
                `;
                return;
            }

            const slotsHtml = slots.map(time => {
                const endTime = this.calculateEndTime(time, service.duration);
                const isSelected = this.bookingData.time === time;

                return `
                    <div class="time-slot ${isSelected ? 'selected' : ''}" 
                         data-time="${time}"
                         onclick="bookingFlow.selectTime('${time}')">
                        <div class="time-start">${time}</div>
                        <div class="time-end">${endTime}</div>
                    </div>
                `;
            }).join('');

            document.getElementById('time-slots-container').innerHTML = `
                <div class="time-slots">
                    ${slotsHtml}
                </div>
                <div class="booking-actions">
                    <button class="booking-action-btn" 
                            id="continue-btn"
                            onclick="bookingFlow.nextStep()"
                            ${!this.bookingData.time ? 'disabled' : ''}>
                        Продолжить
                    </button>
                </div>
            `;

        } catch (error) {
            console.error('Ошибка загрузки слотов:', error);
            document.getElementById('time-slots-container').innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки доступного времени</p>
                    <button class="btn-secondary" onclick="bookingFlow.loadTimeSlots()">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    /**
     * Выбор времени
     */
    selectTime(time) {
        this.bookingData.time = time;

        // Обновляем выделение
        document.querySelectorAll('.time-slot').forEach(slot => {
            slot.classList.remove('selected');
        });
        document.querySelector(`[data-time="${time}"]`).classList.add('selected');

        // Активируем кнопку "Продолжить"
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.disabled = false;
        }
    }

    /**
     * ШАГ 4: Контактные данные
     */
    renderStep4() {
        const { clientName, clientPhone, comment } = this.bookingData;

        const html = `
            <div class="booking-step" data-step="4">
                <div class="page-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Контактные данные</h2>
                    <div class="step-indicator">Шаг 4 из 4</div>
                </div>

                <div class="page-container">
                    <form id="contact-form" onsubmit="return false;">
                        <div class="form-group">
                            <label for="client-name">Ваше имя *</label>
                            <input 
                                type="text" 
                                id="client-name" 
                                value="${clientName}"
                                placeholder="Введите ваше имя"
                                required>
                        </div>

                        <div class="form-group">
                            <label for="client-phone">Телефон *</label>
                            <input 
                                type="tel" 
                                id="client-phone" 
                                value="${clientPhone}"
                                placeholder="+7 (___) ___-__-__"
                                required>
                            <small>Мы отправим вам напоминание о записи</small>
                        </div>

                        <div class="form-group">
                            <label for="client-comment">Комментарий (необязательно)</label>
                            <textarea 
                                id="client-comment" 
                                placeholder="Есть пожелания?">${comment}</textarea>
                        </div>
                    </form>
                </div>

                <div class="booking-actions">
                    <button class="booking-action-btn" onclick="bookingFlow.saveContactsAndContinue()">
                        Продолжить
                    </button>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        // Автозаполнение из Telegram
        if (window.Telegram?.WebApp?.initDataUnsafe?.user && !clientName) {
            const user = window.Telegram.WebApp.initDataUnsafe.user;
            document.getElementById('client-name').value = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        }
    }

    /**
     * Сохранить контакты и перейти к подтверждению
     */
    saveContactsAndContinue() {
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const comment = document.getElementById('client-comment').value.trim();

        if (!name) {
            showToast('Введите ваше имя', 'error');
            return;
        }

        if (!phone) {
            showToast('Введите номер телефона', 'error');
            return;
        }

        this.bookingData.clientName = name;
        this.bookingData.clientPhone = phone;
        this.bookingData.comment = comment;

        this.nextStep();
    }

    /**
     * ШАГ 5: Подтверждение записи
     */
    renderStep5() {
        const { master, service, date, time, clientName, clientPhone, comment } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);

        const html = `
            <div class="booking-step" data-step="5">
                <div class="page-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Подтверждение записи</h2>
                </div>

                <div class="page-container">
                    <div class="booking-confirmation">
                        <h3>Проверьте данные записи</h3>

                        <div class="confirmation-section">
                            <div class="section-title">МАСТЕР</div>
                            <div class="master-card-mini">
                                <img src="${master.photo_url}" alt="${master.name}">
                                <div>
                                    <strong>${master.name}</strong>
                                    <small>${master.specialty}</small>
                                </div>
                            </div>
                        </div>

                        <div class="confirmation-section">
                            <div class="section-title">УСЛУГА</div>
                            <div class="service-card-mini">
                                <strong>${service.name}</strong>
                                <div class="service-meta">
                                    <span><i class="fas fa-clock"></i> ${service.duration} мин</span>
                                    <span><i class="fas fa-ruble-sign"></i> ${service.price} ₽</span>
                                </div>
                            </div>
                        </div>

                        <div class="confirmation-section">
                            <div class="section-title">ДАТА И ВРЕМЯ</div>
                            <div class="datetime-card">
                                <div><i class="fas fa-calendar"></i> ${formatDate(date)}</div>
                                <div><i class="fas fa-clock"></i> ${time} - ${endTime}</div>
                            </div>
                        </div>

                        <div class="confirmation-section">
                            <div class="section-title">КОНТАКТЫ</div>
                            <div class="contact-card">
                                <div><i class="fas fa-user"></i> Глеб Радаев</div>
                                <div><i class="fas fa-phone"></i> +7 (950) 353-70-90</div>
                                ${comment ? `<div><i class="fas fa-comment"></i> ${comment}</div>` : ''}
                            </div>
                        </div>

                        <div class="booking-total">
                            <span class="booking-total-label">Итого:</span>
                            <span class="booking-total-value">${service.price} ₽</span>
                        </div>
                    </div>
                </div>

                <div class="booking-actions">
                    <button 
                        class="booking-action-btn" 
                        id="confirm-booking-btn"
                        onclick="bookingFlow.confirmBooking()">
                        Подтвердить запись
                    </button>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
    }

    /**
     * Подтверждение и создание записи
     */
    async confirmBooking() {
        const button = document.getElementById('confirm-booking-btn');
        button.disabled = true;
        button.innerHTML = '<div class="spinner"></div> Создаём запись...';

        try {
            const { master, service, date, time, clientName, clientPhone, comment } = this.bookingData;

            const bookingPayload = {
                master_id: master.id,
                service_id: service.id,
                date: date,
                time_start: time,
                client_name: clientName,
                client_phone: clientPhone,
                comment: comment || null
            };

            const result = await this.api.createBooking(bookingPayload);

            // Успешно создана запись
            this.showSuccessScreen(result);

        } catch (error) {
            console.error('Ошибка создания записи:', error);
            button.disabled = false;
            button.innerHTML = 'Подтвердить запись';
            
            if (error.message.includes('занято')) {
                showToast('Это время уже занято. Пожалуйста, выберите другое', 'error');
                this.currentStep = 3;
                this.renderStep3();
            } else {
                showToast('Ошибка при создании записи. Попробуйте снова', 'error');
            }
        }
    }

    /**
     * Экран успешной записи
     */
    showSuccessScreen(booking) {
        const { master, service, date, time } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);

        const html = `
            <div class="success-screen">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>

                <h2>Запись успешно создана!</h2>
                <p class="success-message">
                    Ждём вас ${formatDate(date)} в ${time}
                </p>

                <div class="booking-details-card">
                    <div class="detail-row">
                        <span>Мастер:</span>
                        <strong>${master.name}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Услуга:</span>
                        <strong>${service.name}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Дата:</span>
                        <strong>${formatDate(date)}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Время:</span>
                        <strong>${time} - ${endTime}</strong>
                    </div>
                    <div class="detail-row">
                        <span>Стоимость:</span>
                        <strong>${service.price} ₽</strong>
                    </div>
                </div>

                <div class="success-actions">
                    <button class="btn btn-primary" onclick="router.navigate('/bookings')">
                        Мои записи
                    </button>
                    <button class="btn btn-secondary" onclick="router.navigate('/')">
                        На главную
                    </button>
                </div>

                <p class="reminder-text">
                    <i class="fas fa-bell"></i>
                    Мы отправим вам напоминание за 24 часа и за 1 час до визита
                </p>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        // Отправляем уведомление через Telegram
        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert('Запись успешно создана!');
        }
    }

    /**
     * Переход к следующему шагу
     */
    nextStep() {
        this.currentStep++;
        this.render();
    }

    /**
     * Переход к предыдущему шагу
     */
    prevStep() {
        this.currentStep--;
        this.render();
    }

    /**
     * Отрисовка текущего шага
     */
    render() {
        switch (this.currentStep) {
            case 1:
                this.renderStep1();
                break;
            case 2:
                this.renderStep2();
                break;
            case 3:
                this.renderStep3();
                break;
            case 4:
                this.renderStep4();
                break;
            case 5:
                this.renderStep5();
                break;
            default:
                this.renderStep1();
        }
    }

    /**
     * Вспомогательная функция: рассчитать время окончания
     */
    calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }
}

// Создаём глобальный экземпляр для доступа из HTML
window.bookingFlow = new BookingFlow();