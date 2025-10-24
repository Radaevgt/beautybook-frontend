/**
 * Утилиты и вспомогательные функции
 */

// ============================================
// ЗАГРУЗКА
// ============================================

/**
 * Показать экран загрузки
 */
export function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

/**
 * Скрыть экран загрузки
 */
export function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// ============================================
// ФОРМАТИРОВАНИЕ ДАТЫ И ВРЕМЕНИ
// ============================================

/**
 * Форматировать дату в читаемый вид
 * @param {string|Date} dateStr - Дата в формате YYYY-MM-DD или объект Date
 * @returns {string} - "25 октября, понедельник"
 */
export function formatDate(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    const options = {
        day: 'numeric',
        month: 'long',
        weekday: 'long'
    };
    
    return date.toLocaleDateString('ru-RU', options);
}

/**
 * Форматировать дату кратко
 * @param {string|Date} dateStr - Дата
 * @returns {string} - "25.10.2025"
 */
export function formatDateShort(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
}

/**
 * Форматировать время
 * @param {string} timeStr - Время в формате HH:MM
 * @returns {string} - "14:30"
 */
export function formatTime(timeStr) {
    if (!timeStr) return '';
    
    // Если уже в правильном формате, возвращаем как есть
    if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}$/)) {
        return timeStr;
    }
    
    // Иначе парсим и форматируем
    const [hours, minutes] = timeStr.split(':');
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Получить относительное время
 * @param {string|Date} dateStr - Дата
 * @returns {string} - "сегодня", "завтра", "через 3 дня"
 */
export function getRelativeDate(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'завтра';
    if (diffDays === -1) return 'вчера';
    if (diffDays > 1 && diffDays < 7) return `через ${diffDays} дня`;
    if (diffDays < -1 && diffDays > -7) return `${Math.abs(diffDays)} дня назад`;
    
    return formatDate(date);
}

/**
 * Проверить что дата в будущем
 */
export function isFutureDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date >= today;
}

// ============================================
// ФОРМАТИРОВАНИЕ ЧИСЕЛ
// ============================================

/**
 * Форматировать цену
 * @param {number} price - Цена
 * @returns {string} - "1 500 ₽"
 */
export function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

/**
 * Форматировать длительность
 * @param {number} minutes - Минуты
 * @returns {string} - "1 ч 30 мин" или "45 мин"
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} мин`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
        return `${hours} ч`;
    }
    
    return `${hours} ч ${mins} мин`;
}

// ============================================
// TOAST УВЕДОМЛЕНИЯ
// ============================================

/**
 * Показать toast уведомление
 * @param {string} message - Текст сообщения
 * @param {string} type - Тип: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Длительность в мс (по умолчанию 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Иконка в зависимости от типа
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================

/**
 * Показать модальное окно
 * @param {string} content - HTML контент
 */
export function showModal(content) {
    const overlay = document.getElementById('modal-overlay');
    const body = document.getElementById('modal-body');
    
    if (overlay && body) {
        body.innerHTML = content;
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Скрыть модальное окно
 */
export function hideModal() {
    const overlay = document.getElementById('modal-overlay');
    
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ============================================
// ВАЛИДАЦИЯ
// ============================================

/**
 * Валидация телефона
 * @param {string} phone - Номер телефона
 * @returns {boolean}
 */
export function validatePhone(phone) {
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    return phoneRegex.test(phone);
}

/**
 * Валидация email
 * @param {string} email - Email
 * @returns {boolean}
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Очистить номер телефона от форматирования
 * @param {string} phone - Номер телефона
 * @returns {string} - Только цифры
 */
export function cleanPhone(phone) {
    return phone.replace(/\D/g, '');
}

// ============================================
// DEBOUNCE
// ============================================

/**
 * Debounce функция (задержка выполнения)
 * @param {Function} func - Функция
 * @param {number} wait - Задержка в мс
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// РАБОТА С LOCALSTORAGE
// ============================================

/**
 * Сохранить в localStorage
 * @param {string} key - Ключ
 * @param {any} value - Значение
 */
export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
}

/**
 * Получить из localStorage
 * @param {string} key - Ключ
 * @returns {any}
 */
export function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Ошибка чтения из localStorage:', error);
        return null;
    }
}

/**
 * Удалить из localStorage
 * @param {string} key - Ключ
 */
export function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Ошибка удаления из localStorage:', error);
    }
}

// ============================================
// КОПИРОВАНИЕ В БУФЕР ОБМЕНА
// ============================================

/**
 * Скопировать текст в буфер обмена
 * @param {string} text - Текст для копирования
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Скопировано в буфер обмена', 'success');
    } catch (error) {
        console.error('Ошибка копирования:', error);
        showToast('Ошибка копирования', 'error');
    }
}

// ============================================
// РАБОТА С ИЗОБРАЖЕНИЯМИ
// ============================================

/**
 * Получить placeholder изображение
 * @param {number} width - Ширина
 * @param {number} height - Высота
 * @returns {string} - URL placeholder
 */
export function getPlaceholderImage(width = 300, height = 300) {
    return `https://via.placeholder.com/${width}x${height}`;
}

/**
 * Предзагрузка изображения
 * @param {string} src - URL изображения
 * @returns {Promise}
 */
export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ============================================
// ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ
// ============================================

// Делаем некоторые функции доступными глобально для использования в HTML
if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.copyToClipboard = copyToClipboard;
}
