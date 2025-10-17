/**
 * Вспомогательные функции
 */

const Utils = {
    /**
     * Форматировать цену
     */
    formatPrice(price) {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    },
    
    /**
     * Форматировать дату
     */
    formatDate(date, format = 'long') {
        const d = typeof date === 'string' ? new Date(date) : date;
        
        if (format === 'short') {
            return d.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        }
        
        return d.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    /**
     * Форматировать время
     */
    formatTime(time) {
        if (typeof time === 'string') {
            return time.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
        }
        
        const d = time instanceof Date ? time : new Date(time);
        return d.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Форматировать дату и время
     */
    formatDateTime(datetime) {
        const d = typeof datetime === 'string' ? new Date(datetime) : datetime;
        return `${this.formatDate(d, 'short')} ${this.formatTime(d)}`;
    },
    
    /**
     * Форматировать длительность
     */
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0 && mins > 0) {
            return `${hours} ч ${mins} мин`;
        } else if (hours > 0) {
            return `${hours} ч`;
        } else {
            return `${mins} мин`;
        }
    },
    
    /**
     * Форматировать телефон
     */
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length === 11 && cleaned.startsWith('7')) {
            return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
        }
        
        return phone;
    },
    
    /**
     * Получить день недели
     */
    getWeekday(date, format = 'long') {
        const d = typeof date === 'string' ? new Date(date) : date;
        
        if (format === 'short') {
            return d.toLocaleDateString('ru-RU', { weekday: 'short' });
        }
        
        return d.toLocaleDateString('ru-RU', { weekday: 'long' });
    },
    
    /**
     * Получить название месяца
     */
    getMonthName(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    },
    
    /**
     * Проверка на сегодня
     */
    isToday(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const today = new Date();
        
        return d.getDate() === today.getDate() &&
               d.getMonth() === today.getMonth() &&
               d.getFullYear() === today.getFullYear();
    },
    
    /**
     * Проверка на завтра
     */
    isTomorrow(date) {
        const d = typeof date === 'string' ? new Date(date) : date;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        return d.getDate() === tomorrow.getDate() &&
               d.getMonth() === tomorrow.getMonth() &&
               d.getFullYear() === tomorrow.getFullYear();
    },
    
    /**
     * Добавить дни к дате
     */
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },
    
    /**
     * Получить текст статуса
     */
    getStatusText(status) {
        const statuses = {
            'confirmed': 'Подтверждено',
            'cancelled': 'Отменено',
            'completed': 'Завершено',
            'no_show': 'Не пришел'
        };
        
        return statuses[status] || status;
    },
    
    /**
     * Получить класс статуса
     */
    getStatusClass(status) {
        const classes = {
            'confirmed': 'badge-success',
            'cancelled': 'badge-error',
            'completed': 'badge-info',
            'no_show': 'badge-warning'
        };
        
        return classes[status] || 'badge-info';
    },
    
    /**
     * Склонение числительных
     */
    pluralize(number, forms) {
        // forms = ['год', 'года', 'лет']
        const cases = [2, 0, 1, 1, 1, 2];
        return forms[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[Math.min(number % 10, 5)]];
    },
    
    /**
     * Дебаунс
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Троттлинг
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Показать/скрыть элемент
     */
    toggleElement(element, show) {
        if (show) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    },
    
    /**
     * Показать лоадер
     */
    showLoader(container) {
        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
    },
    
    /**
     * Показать пустое состояние
     */
    showEmptyState(container, message, icon = '🔍') {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <p class="empty-state-text">${message}</p>
            </div>
        `;
    },
    
    /**
     * Показать ошибку
     */
    showError(container, message) {
        container.innerHTML = `
            <div class="alert alert-error">
                <span class="alert-icon">⚠️</span>
                <div class="alert-content">
                    <div class="alert-title">Ошибка</div>
                    <p>${message}</p>
                </div>
            </div>
        `;
    },
    
    /**
     * Скроллить наверх
     */
    scrollToTop(smooth = true) {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto'
        });
    },
    
    /**
     * Скроллить к элементу
     */
    scrollToElement(element, smooth = true) {
        element.scrollIntoView({
            behavior: smooth ? 'smooth' : 'auto',
            block: 'start'
        });
    },
    
    /**
     * Генерация звезд рейтинга
     */
    generateStars(rating, maxStars = 5) {
        let html = '<div class="rating-stars">';
        
        for (let i = 1; i <= maxStars; i++) {
            if (i <= rating) {
                html += '<span class="star filled">★</span>';
            } else {
                html += '<span class="star">★</span>';
            }
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * Валидация email
     */
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    /**
     * Валидация телефона
     */
    isValidPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 12;
    },
    
    /**
     * Сохранить в localStorage
     */
    saveToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
        }
    },
    
    /**
     * Получить из localStorage
     */
    getFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Ошибка чтения из localStorage:', e);
            return defaultValue;
        }
    },
    
    /**
     * Удалить из localStorage
     */
    removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Ошибка удаления из localStorage:', e);
        }
    }
};