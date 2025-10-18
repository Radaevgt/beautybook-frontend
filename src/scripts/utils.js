/**
 * Вспомогательные утилиты
 */

/**
 * Показать индикатор загрузки
 */
function showLoading() {
    const app = document.getElementById('app');
    if (!app) return;
    
    app.innerHTML = `
        <div class="loading-screen">
            <div class="loader"></div>
            <p>Загрузка BeautyBook...</p>
        </div>
    `;
}

/**
 * Скрыть индикатор загрузки
 */
function hideLoading() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.remove();
    }
}

/**
 * Форматировать дату
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    };
    return date.toLocaleDateString('ru-RU', options);
}

/**
 * Форматировать время
 */
function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5);
}

/**
 * Форматировать цену
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

/**
 * Debounce функция
 */
function debounce(func, wait) {
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

// Экспорт всех функций
export { showLoading, hideLoading, formatDate, formatTime, formatPrice, debounce };
