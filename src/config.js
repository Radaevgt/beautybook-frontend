/**
 * Конфигурация приложения
 */

const CONFIG = {
    // API URL
    API_URL: 'https://billye-unoutraged-mephitically.ngrok-free.dev',
    
    // Telegram Bot
    BOT_USERNAME: '@salonTESTrad_bot',
    
    // Настройки
    BOOKING_SLOT_DURATION: 30, // минуты
    MAX_BOOKING_DAYS: 30, // дней вперёд
    MIN_CANCEL_HOURS: 24, // минимум часов до отмены
    
    // Pagination
    ITEMS_PER_PAGE: 20,
    
    // Тексты
    TEXTS: {
        APP_NAME: 'BeautyBook',
        LOADING: 'Загрузка...',
        ERROR: 'Произошла ошибка',
        NO_DATA: 'Нет данных',
        CONFIRM: 'Подтвердить',
        CANCEL: 'Отменить',
        BACK: 'Назад',
        NEXT: 'Далее',
        SAVE: 'Сохранить',
    }
};

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}