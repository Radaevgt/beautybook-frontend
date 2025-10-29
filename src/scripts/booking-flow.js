/**
 * Модуль процесса бронирования
 * 
 * ✅✅✅ ОКОНЧАТЕЛЬНАЯ РАБОЧАЯ ВЕРСИЯ
 * - Прямые вызовы app.renderMyBookings() и app.renderHome()
 * - Не зависит от роутера
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

    async start(masterId, serviceId) {
        try {
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

    renderStep1() {
        const { master, service } = this.bookingData;

        const html = `
            <div class="booking-step" data-step="1">
                <div class="booking-header">
                    <button class="back-btn" onclick="history.back()">
                        <i class="fas fa-arrow-left"></i>
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
                                <i class="fas fa-clock"></i> ${service.duration} мин
                            </span>
                            <span class="price">
                                <i class="fas fa-ruble-sign"></i> ${service.price} ₽
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

    renderStep2() {
        const html = `
            <div class="booking-step" data-step="2">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Выберите дату</h2>
                    <div class="step-indicator">Шаг 2 из 4</div>
                </div>

                <div class="calendar-container">
                    <div id="calendar"></div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarEl = document.getElementById('calendar');
        const today = new Date();

        const dates = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        const months = {};
        dates.forEach(date => {
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (!months[monthKey]) {
                months[monthKey] = {
                    name: date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' }),
                    dates: []
                };
            }
            months[monthKey].dates.push(date);
        });

        let html = '';
        for (const monthKey in months) {
            const month = months[monthKey];
            html += `
                <div class="calendar-month">
                    <h3 class="month-title">${month.name}</h3>
                    <div class="calendar-dates">
            `;

            month.dates.forEach(date => {
                const dateStr = date.toISOString().split('T')[0];
                const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                const dayNum = date.getDate();
                const isToday = date.toDateString() === today.toDateString();

                html += `
                    <button 
                        class="calendar-date ${isToday ? 'today' : ''}" 
                        data-date="${dateStr}"
                        onclick="bookingFlow.selectDate('${dateStr}')">
                        <div class="date-day">${dayName}</div>
                        <div class="date-num">${dayNum}</div>
                    </button>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        calendarEl.innerHTML = html;
    }

    async selectDate(dateStr) {
        this.bookingData.date = dateStr;
        document.querySelectorAll('.calendar-date').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-date="${dateStr}"]`).classList.add('selected');
        setTimeout(() => this.nextStep(), 300);
    }

    async renderStep3() {
        const { master, date } = this.bookingData;

        const html = `
            <div class="booking-step" data-step="3">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Выберите время</h2>
                    <div class="step-indicator">Шаг 3 из 4</div>
                </div>

                <div class="selected-date-info">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(date)}
                </div>

                <div class="time-slots-container" id="time-slots">
                    <div class="loading">Загрузка доступных слотов...</div>
                </div>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        try {
            const response = await this.api.getAvailableSlots(master.id, date);
            this.renderTimeSlots(response.available_slots);
        } catch (error) {
            console.error('Ошибка загрузки слотов:', error);
            document.getElementById('time-slots').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Не удалось загрузить доступные слоты</p>
                </div>
            `;
        }
    }

    renderTimeSlots(slots) {
        const container = document.getElementById('time-slots');

        if (slots.length === 0) {
            container.innerHTML = `
                <div class="empty-message">
                    <i class="fas fa-calendar-times"></i>
                    <p>На выбранную дату нет доступных слотов</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="time-slots-grid">
                ${slots.map(time => `
                    <button 
                        class="time-slot" 
                        data-time="${time}"
                        onclick="bookingFlow.selectTime('${time}')">
                        ${time}
                    </button>
                `).join('')}
            </div>
        `;
    }

    selectTime(time) {
        this.bookingData.time = time;
        document.querySelectorAll('.time-slot').forEach(btn => btn.classList.remove('selected'));
        document.querySelector(`[data-time="${time}"]`).classList.add('selected');
        setTimeout(() => this.nextStep(), 300);
    }

    renderStep4() {
        const { master, service, date, time } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);
        const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
        const defaultName = tgUser ? `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim() : '';

        const html = `
            <div class="booking-step" data-step="4">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <h2>Контактные данные</h2>
                    <div class="step-indicator">Шаг 4 из 4</div>
                </div>

                <div class="booking-summary-small">
                    <div class="summary-row">
                        <span>Мастер:</span>
                        <strong>${master.name}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Услуга:</span>
                        <strong>${service.name}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Дата и время:</span>
                        <strong>${formatDate(date)}, ${time} - ${endTime}</strong>
                    </div>
                </div>

                <form id="contact-form" class="contact-form">
                    <div class="form-group">
                        <label for="client-name">
                            <i class="fas fa-user"></i>
                            Ваше имя *
                        </label>
                        <input 
                            type="text" 
                            id="client-name" 
                            name="clientName" 
                            placeholder="Иван Иванов"
                            value="${defaultName}"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="client-phone">
                            <i class="fas fa-phone"></i>
                            Телефон *
                        </label>
                        <input 
                            type="tel" 
                            id="client-phone" 
                            name="clientPhone" 
                            placeholder="+7 (999) 123-45-67"
                            required
                        >
                    </div>

                    <div class="form-group">
                        <label for="client-comment">
                            <i class="fas fa-comment"></i>
                            Комментарий (необязательно)
                        </label>
                        <textarea 
                            id="client-comment" 
                            name="comment" 
                            placeholder="Дополнительные пожелания..."
                            rows="3"
                        ></textarea>
                    </div>

                    <button type="submit" class="booking-action-btn">
                        Далее
                    </button>
                </form>
            </div>
        `;

        document.getElementById('app').innerHTML = html;
        document.getElementById('contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveContactData();
        });
    }

    saveContactData() {
        const form = document.getElementById('contact-form');
        const formData = new FormData(form);

        this.bookingData.clientName = formData.get('clientName');
        this.bookingData.clientPhone = formData.get('clientPhone');
        this.bookingData.comment = formData.get('comment');

        if (!this.bookingData.clientName || !this.bookingData.clientPhone) {
            showToast('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        this.nextStep();
    }

    renderStep5() {
        const { master, service, date, time, clientName, clientPhone, comment } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);

        const html = `
            <div class="booking-step" data-step="5">
                <div class="booking-header">
                    <button class="back-btn" onclick="bookingFlow.prevStep()">
                        <i class="fas fa-arrow-left"></i>
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
                                <span><i class="fas fa-clock"></i> ${service.duration} мин</span>
                                <span><i class="fas fa-ruble-sign"></i> ${service.price} ₽</span>
                            </div>
                        </div>
                    </div>

                    <div class="confirmation-section">
                        <div class="section-title">Дата и время</div>
                        <div class="datetime-card">
                            <div><i class="fas fa-calendar"></i> ${formatDate(date)}</div>
                            <div><i class="fas fa-clock"></i> ${time} - ${endTime}</div>
                        </div>
                    </div>

                    <div class="confirmation-section">
                        <div class="section-title">Контакты</div>
                        <div class="contact-card">
                            <div><i class="fas fa-user"></i> ${clientName}</div>
                            <div><i class="fas fa-phone"></i> ${clientPhone}</div>
                            ${comment ? `<div><i class="fas fa-comment"></i> ${comment}</div>` : ''}
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

    async confirmBooking() {
        const button = document.getElementById('confirm-booking-btn');
        button.disabled = true;
        button.innerHTML = '<div class="spinner"></div> Создаём запись...';

        try {
            const { master, service, date, time, clientName, clientPhone, comment } = this.bookingData;

            const result = await this.api.createBooking({
                master_id: master.id,
                service_id: service.id,
                date: date,
                time_start: time,
                client_name: clientName,
                client_phone: clientPhone,
                comment: comment || null
            });

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

    showSuccessScreen(booking) {
        const { master, service, date, time } = this.bookingData;
        const endTime = this.calculateEndTime(time, service.duration);

        const html = `
            <div class="success-screen">
                <div class="success-icon">
                    <i class="fas fa-check-circle"></i>
                </div>

                <h2>Запись успешно создана!</h2>
                <p class="success-message">Ждём вас ${formatDate(date)} в ${time}</p>

                <div class="booking-details-card">
                    <div class="detail-row"><span>Мастер:</span><strong>${master.name}</strong></div>
                    <div class="detail-row"><span>Услуга:</span><strong>${service.name}</strong></div>
                    <div class="detail-row"><span>Дата:</span><strong>${formatDate(date)}</strong></div>
                    <div class="detail-row"><span>Время:</span><strong>${time} - ${endTime}</strong></div>
                    <div class="detail-row"><span>Стоимость:</span><span class="booking-total-value">${service.price} ₽</span></div>
                </div>

                <div class="success-actions">
                    <button class="btn-primary" id="btn-my-bookings">Мои записи</button>
                    <button class="btn-secondary" id="btn-home">На главную</button>
                </div>

                <p class="reminder-text">
                    <i class="fas fa-bell"></i>
                    Мы отправим вам напоминание за 24 часа и за 1 час до визита
                </p>
            </div>
        `;

        document.getElementById('app').innerHTML = html;

        setTimeout(() => {
            const btnBookings = document.getElementById('btn-my-bookings');
            const btnHome = document.getElementById('btn-home');

            if (btnBookings) {
                btnBookings.onclick = () => {
                    console.log('📅 Переход на "Мои записи"');
                    if (window.app?.renderMyBookings) {
                        window.app.renderMyBookings();
                    } else {
                        console.error('❌ window.app.renderMyBookings не найден');
                        alert('Ошибка: приложение не загружено');
                    }
                };
            }

            if (btnHome) {
                btnHome.onclick = () => {
                    console.log('🏠 Переход на "Главную"');
                    if (window.app?.renderHome) {
                        window.app.renderHome();
                    } else {
                        console.error('❌ window.app.renderHome не найден');
                        alert('Ошибка: приложение не загружено');
                    }
                };
            }
        }, 100);

        if (window.Telegram?.WebApp) {
            window.Telegram.WebApp.showAlert('Запись успешно создана!');
        }
    }

    nextStep() {
        this.currentStep++;
        this.render();
    }

    prevStep() {
        this.currentStep--;
        this.render();
    }

    render() {
        switch (this.currentStep) {
            case 1: this.renderStep1(); break;
            case 2: this.renderStep2(); break;
            case 3: this.renderStep3(); break;
            case 4: this.renderStep4(); break;
            case 5: this.renderStep5(); break;
            default: this.renderStep1();
        }
    }

    calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + durationMinutes;
        const endHours = Math.floor(totalMinutes / 60);
        const endMinutes = totalMinutes % 60;
        return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
    }
}

window.bookingFlow = new BookingFlow();
console.log('✅ BookingFlow готов (прямые вызовы app)');
