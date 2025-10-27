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
                <div class="booking-header">
                    <button class="back-btn" onclick="history.back()">
                        <i class="icon-arrow-left"></i>
                    </button>
                    <h2>Подтверждение выбора</h2>
                    <div class="step-indicator">Шаг 1 из 4</div>
                </div>

                <div class="booking-summary">
                    <div class="master-info">
                        <img src="${master.photo_url}" alt="${master.name}" class="master-avatar">
                        <div>
                            <h3>${master.name}</h3>
                            <p class="specialty">${master.specialty}</p>
                        </div>
                    </div>

                    <div class="service-info">
                        <h4>${service.name}</h4>
                        <div class="service-details">
                            <span class="duration">
                                <i class="icon-clock"></i> ${service.duration} мин
                            </span>
                            <span class="price">
                                <i class="icon-ruble"></i> ${service.price} ₽
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
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="icon-arrow-left"></i>
                    </button>
                    <h2>Выберите дату</h2>
                    <div class="step-indicator">Шаг 2 из 4</div>
                </div>

                <div id="calendar-container">
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
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="icon-arrow-left"></i>
                    </button>
                    <h2>Выберите время</h2>
                    <div class="step-indicator">Шаг 3 из 4</div>
                </div>

                <div class="selected-date">
                    <i class="icon-calendar"></i>
                    ${formatDate(date)}
                </div>

                <div id="time-slots-container">
                    <div class="loading-spinner">Загрузка доступного времени...</div>
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
                        <i class="icon-calendar-x"></i>
                        <p>На эту дату нет свободного времени</p>
                        <button class="btn-secondary" onclick="bookingFlow.prevStep()">
                            Выбрать другую дату
                        </button>
                    </div>
                `;
                return;
            }

            const slotsHtml = slots.map(time => {
                const [hours, minutes] = time.split(':');
                const endTime = this.calculateEndTime(time, service.duration);
                const isSelected = this.bookingData.time === time;

                return `
                    <div class="time-slot ${isSelected ? 'selected' : ''}" 
                         data-time="${time}"
                         onclick="bookingFlow.selectTime('${time}')">
                        <div class="time-start">${time}</div>
                        <div class="time-end">до ${endTime}</div>
                    </div>
                `;
            }).join('');

            document.getElementById('time-slots-container').innerHTML = `
                <div class="time-slots-grid">
                    ${slotsHtml}
                </div>
            `;

        } catch (error) {
            console.error('Ошибка загрузки слотов:', error);
            document.getElementById('time-slots-container').innerHTML = `
                <div class="error-state">
                    <i class="icon-alert"></i>
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

        // Переходим к вводу контактов
        setTimeout(() => this.nextStep(), 300);
    }

    /**
     * ШАГ 4: Ввод контактных данных
     */
    renderStep4() {
        const tg = window.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user;

        // Автозаполнение имени из Telegram
        if (user && !this.bookingData.clientName) {
            this.bookingData.clientName = `${user.first_name} ${user.last_name || ''}`.trim();
        }

        const html = `
            <div class="booking-step" data-step="4">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="icon-arrow-left"></i>
                    </button>
                    <h2>Контактные данные</h2>
                    <div class="step-indicator">Шаг 4 из 4</div>
                </div>

                <form id="contact-form" onsubmit="bookingFlow.submitBooking(event)">
                    <div class="form-group">
                        <label for="client-name">Ваше имя *</label>
                        <input 
                            type="text" 
                            id="client-name" 
                            name="clientName"
                            value="${this.bookingData.clientName}"
                            placeholder="Иван Иванов"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="client-phone">Телефон *</label>
                        <input 
                            type="tel" 
                            id="client-phone" 
                            name="clientPhone"
                            value="${this.bookingData.clientPhone}"
                            placeholder="+7 (999) 123-45-67"
                            pattern="\\+7\\s?\\(?\\d{3}\\)?\\s?\\d{3}-?\\d{2}-?\\d{2}"
                            required
                        >
                        <small>Формат: +7 (999) 123-45-67</small>
                    </div>

                    <div class="form-group">
                        <label for="comment">Комментарий (необязательно)</label>
                        <textarea 
                            id="comment" 
                            name="comment"
                            placeholder="Особые пожелания или вопросы"
                            rows="3"
                        >${this.bookingData.comment}</textarea>
                    </div>

                    <div class="form-group checkbox-group">
                        <label>
                            <input type="checkbox" name="notifications" checked>
                            <span>Отправлять напоминания о записи</span>
                        </label>
                    </div>

                    <button type="submit" class="booking-action-btn">
                        Продолжить
                    </button>
                </form>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        // Маска для телефона
        this.setupPhoneMask();
    }

    /**
     * Маска для ввода телефона
     */
    setupPhoneMask() {
        const phoneInput = document.getElementById('client-phone');
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.length > 0) {
                if (value[0] !== '7') {
                    value = '7' + value;
                }
                
                let formatted = '+7';
                if (value.length > 1) {
                    formatted += ' (' + value.substring(1, 4);
                }
                if (value.length >= 5) {
                    formatted += ') ' + value.substring(4, 7);
                }
                if (value.length >= 8) {
                    formatted += '-' + value.substring(7, 9);
                }
                if (value.length >= 10) {
                    formatted += '-' + value.substring(9, 11);
                }
                
                e.target.value = formatted;
            }
        });
    }

    /**
     * Отправка формы и переход к подтверждению
     */
    submitBooking(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        this.bookingData.clientName = formData.get('clientName');
        this.bookingData.clientPhone = formData.get('clientPhone');
        this.bookingData.comment = formData.get('comment');
        
        this.nextStep();
    }

    /**
     * ШАГ 5: Финальное подтверждение
     */
    renderStep5() {
        const { master, service, date, time, clientName, clientPhone, comment } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);

        const html = `
            <div class="booking-step" data-step="5">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="icon-arrow-left"></i>
                    </button>
                    <h2>Подтверждение записи</h2>
                </div>

                <div class="booking-confirmation">
                    <h3>Проверьте данные записи</h3>

                    <div class="confirmation-section">
                        <div class="section-title">Мастер</div>
                        <div class="master-card-mini">
                            <img src="${master.photo_url}" alt="${master.name}">
                            <div>
                                <strong>${master.name}</strong>
                                <small>${master.specialty}</small>
                            </div>
                        </div>
                    </div>

                    <div class="confirmation-section">
                        <div class="section-title">Услуга</div>
                        <div class="service-card-mini">
                            <strong>${service.name}</strong>
                            <div class="service-meta">
                                <span><i class="icon-clock"></i> ${service.duration} мин</span>
                                <span><i class="icon-ruble"></i> ${service.price} ₽</span>
                            </div>
                        </div>
                    </div>

                    <div class="confirmation-section">
                        <div class="section-title">Дата и время</div>
                        <div class="datetime-card">
                            <div><i class="icon-calendar"></i> ${formatDate(date)}</div>
                            <div><i class="icon-clock"></i> ${time} - ${endTime}</div>
                        </div>
                    </div>

                    <div class="confirmation-section">
                        <div class="section-title">Контакты</div>
                        <div class="contact-card">
                            <div><i class="icon-user"></i> ${clientName}</div>
                            <div><i class="icon-phone"></i> ${clientPhone}</div>
                            ${comment ? `<div><i class="icon-message"></i> ${comment}</div>` : ''}
                        </div>
                    </div>

                    <div class="booking-total">
                        <span class="booking-total-label">Итого:</span>
                        <span class="booking-total-value">${service.price} ₽</span>
                    </div>
                </div>

                <button 
                    class="booking-action-btn" 
                    id="confirm-booking-btn"
                    onclick="bookingFlow.confirmBooking()">
                    Подтвердить запись
                </button>
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
                    <i class="icon-check-circle"></i>
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
                        <span class="booking-total-value">${service.price} ₽</span>
                    </div>
                </div>

                <div class="success-actions">
                    <button class="btn-primary" onclick="router.navigate('bookings')">
                        Мои записи
                    </button>
                    <button class="btn-secondary" onclick="router.navigate('home')">
                        На главную
                    </button>
                </div>

                <p class="reminder-text">
                    <i class="icon-bell"></i>
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
