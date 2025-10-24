/**
 * Конфигурация приложения
 */

const CONFIG = {
    // API URL - ВАЖНО: с /api в конце
    API_URL: 'https://billye-unoutraged-mephitically.ngrok-free.dev/api',
    
    // Telegram Bot
    BOT_USERNAME: 'salonTESTrad_bot',
    
    // Настройки
    BOOKING_SLOT_DURATION: 30,
    MAX_BOOKING_DAYS: 30,
    MIN_CANCEL_HOURS: 24,
    
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

// Экспорт по умолчанию
export default CONFIG;
