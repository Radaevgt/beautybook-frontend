/**
 * Утилиты и вспомогательные функции
 */

// ============================================
// ЗАГРУЗКА
// ============================================

export function showLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

export function hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// ============================================
// ФОРМАТИРОВАНИЕ ДАТЫ И ВРЕМЕНИ
// ============================================

export function formatDate(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const options = { day: 'numeric', month: 'long', weekday: 'long' };
    return date.toLocaleDateString('ru-RU', options);
}

export function formatDateShort(dateStr) {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

export function formatTime(timeStr) {
    if (!timeStr) return '';
    if (typeof timeStr === 'string' && timeStr.match(/^\d{2}:\d{2}$/)) {
        return timeStr;
    }
    const [hours, minutes] = timeStr.split(':');
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

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

export function isFutureDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}

// ============================================
// ФОРМАТИРОВАНИЕ ЧИСЕЛ
// ============================================

export function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
}

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

export function showToast(message, type = 'info', duration = 3000) {
    // Создаём контейнер если его нет
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const bgColors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        background: ${bgColors[type] || bgColors.info};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        min-width: 250px;
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ============================================
// МОДАЛЬНЫЕ ОКНА
// ============================================

export function showModal(content) {
    // Создаём контейнер если его нет
    let container = document.getElementById('modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'modal-container';
        document.body.appendChild(container);
    }
    
    const modalHtml = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal" onclick="event.stopPropagation()">
                ${content}
            </div>
        </div>
    `;
    
    container.innerHTML = modalHtml;
    document.body.style.overflow = 'hidden';
    
    // Добавляем стили если их нет
    if (!document.getElementById('modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease;
            }
            
            .modal {
                background: white;
                border-radius: 12px;
                max-width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                animation: scaleIn 0.2s ease;
                padding: 20px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
}

export function hideModal() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.innerHTML = '';
    }
    document.body.style.overflow = '';
}

// Алиас для совместимости с кодом админки
export function closeModal() {
    hideModal();
}

// ============================================
// ВАЛИДАЦИЯ
// ============================================

export function validatePhone(phone) {
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    return phoneRegex.test(phone);
}

export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function cleanPhone(phone) {
    return phone.replace(/\D/g, '');
}

// ============================================
// DEBOUNCE
// ============================================

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
// LOCALSTORAGE
// ============================================

export function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Ошибка сохранения в localStorage:', error);
    }
}

export function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error('Ошибка чтения из localStorage:', error);
        return null;
    }
}

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

export function getPlaceholderImage(width = 300, height = 300) {
    return `https://via.placeholder.com/${width}x${height}`;
}

export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// ============================================
// ГЛОБАЛЬНЫЕ ФУНКЦИИ
// ============================================

if (typeof window !== 'undefined') {
    window.showToast = showToast;
    window.showModal = showModal;
    window.hideModal = hideModal;
    window.closeModal = closeModal;
    window.copyToClipboard = copyToClipboard;
}
