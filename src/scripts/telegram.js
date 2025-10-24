/**
 * Интеграция с Telegram Web App
 */

class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isReady = false;
    }
    
    /**
     * Инициализация Telegram Web App
     */
    init() {
        if (!this.tg) {
            console.warn('Telegram Web App не доступен');
            return;
        }
        
        try {
            // Разворачиваем приложение на весь экран
            this.tg.expand();
            
            // Включаем закрытие по свайпу
            this.tg.enableClosingConfirmation();
            
            // Получаем данные пользователя
            this.user = this.tg.initDataUnsafe?.user;
            
            // Настраиваем тему
            this.setupTheme();
            
            // Говорим что готовы
            this.tg.ready();
            this.isReady = true;
            
            console.log('✅ Telegram Web App инициализирован');
            console.log('Пользователь:', this.user);
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram Web App:', error);
        }
    }
    
    /**
     * Настроить тему приложения
     */
    setupTheme() {
        if (!this.tg) return;
        
        const themeParams = this.tg.themeParams;
        
        // Применяем цвета темы Telegram
        if (themeParams.bg_color) {
            document.documentElement.style.setProperty('--tg-bg-color', themeParams.bg_color);
        }
        
        if (themeParams.text_color) {
            document.documentElement.style.setProperty('--tg-text-color', themeParams.text_color);
        }
        
        if (themeParams.button_color) {
            document.documentElement.style.setProperty('--tg-button-color', themeParams.button_color);
        }
    }
    
    /**
     * Показать главную кнопку
     */
    showMainButton(text, onClick) {
        if (!this.tg) return;
        
        this.tg.MainButton.setText(text);
        this.tg.MainButton.show();
        this.tg.MainButton.onClick(onClick);
    }
    
    /**
     * Скрыть главную кнопку
     */
    hideMainButton() {
        if (!this.tg) return;
        this.tg.MainButton.hide();
    }
    
    /**
     * Показать кнопку "Назад"
     */
    showBackButton(onClick) {
        if (!this.tg) return;
        
        this.tg.BackButton.show();
        this.tg.BackButton.onClick(onClick);
    }
    
    /**
     * Скрыть кнопку "Назад"
     */
    hideBackButton() {
        if (!this.tg) return;
        this.tg.BackButton.hide();
    }
    
    /**
     * Закрыть приложение
     */
    close() {
        if (!this.tg) return;
        this.tg.close();
    }
    
    /**
     * Вибрация
     */
    hapticFeedback(type = 'light') {
        if (!this.tg) return;
        
        const types = {
            'light': () => this.tg.HapticFeedback.impactOccurred('light'),
            'medium': () => this.tg.HapticFeedback.impactOccurred('medium'),
            'heavy': () => this.tg.HapticFeedback.impactOccurred('heavy'),
            'success': () => this.tg.HapticFeedback.notificationOccurred('success'),
            'error': () => this.tg.HapticFeedback.notificationOccurred('error'),
            'warning': () => this.tg.HapticFeedback.notificationOccurred('warning')
        };
        
        if (types[type]) {
            types[type]();
        }
    }
    
    /**
     * Получить данные пользователя
     */
    getUser() {
        return this.user;
    }
    
    /**
     * Получить init data для API запросов
     */
    getInitData() {
        if (!this.tg) return null;
        return this.tg.initData;
    }
}

// Создаём экземпляр
const telegramApp = new TelegramApp();

// Экспортируем
export { telegramApp };
