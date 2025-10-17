/**
 * Интеграция с Telegram Web App SDK
 */

class TelegramApp {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.initData = null;
        this.user = null;
        
        if (this.tg) {
            this.init();
        } else {
            console.warn('Telegram Web App SDK не загружен');
        }
    }
    
    /**
     * Инициализация Telegram Web App
     */
    init() {
        // Разворачиваем приложение на весь экран
        this.tg.expand();
        
        // Включаем кнопку закрытия
        this.tg.enableClosingConfirmation();
        
        // Получаем данные пользователя
        this.initData = this.tg.initData;
        this.user = this.tg.initDataUnsafe?.user;
        
        // Применяем тему Telegram
        this.applyTheme();
        
        console.log('Telegram Web App инициализирован', {
            version: this.tg.version,
            platform: this.tg.platform,
            user: this.user
        });
    }
    
    /**
     * Применить тему из Telegram
     */
    applyTheme() {
        if (!this.tg) return;
        
        const theme = this.tg.themeParams;
        
        if (theme.bg_color) {
            document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color);
        }
        if (theme.text_color) {
            document.documentElement.style.setProperty('--tg-text-color', theme.text_color);
        }
        if (theme.button_color) {
            document.documentElement.style.setProperty('--tg-button-color', theme.button_color);
        }
    }
    
    /**
     * Получить initData для авторизации
     */
    getInitData() {
        return this.initData || '';
    }
    
    /**
     * Получить данные пользователя
     */
    getUser() {
        return this.user;
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
     * Показать уведомление
     */
    showAlert(message) {
        if (!this.tg) {
            alert(message);
            return;
        }
        this.tg.showAlert(message);
    }
    
    /**
     * Показать подтверждение
     */
    showConfirm(message, callback) {
        if (!this.tg) {
            const result = confirm(message);
            callback(result);
            return;
        }
        this.tg.showConfirm(message, callback);
    }
    
    /**
     * Показать попап
     */
    showPopup(params) {
        if (!this.tg || !this.tg.showPopup) {
            this.showAlert(params.message);
            return;
        }
        this.tg.showPopup(params);
    }
    
    /**
     * Вибрация
     */
    hapticFeedback(type = 'light') {
        if (!this.tg || !this.tg.HapticFeedback) return;
        
        switch (type) {
            case 'light':
                this.tg.HapticFeedback.impactOccurred('light');
                break;
            case 'medium':
                this.tg.HapticFeedback.impactOccurred('medium');
                break;
            case 'heavy':
                this.tg.HapticFeedback.impactOccurred('heavy');
                break;
            case 'success':
                this.tg.HapticFeedback.notificationOccurred('success');
                break;
            case 'warning':
                this.tg.HapticFeedback.notificationOccurred('warning');
                break;
            case 'error':
                this.tg.HapticFeedback.notificationOccurred('error');
                break;
        }
    }
    
    /**
     * Закрыть приложение
     */
    close() {
        if (!this.tg) return;
        this.tg.close();
    }
    
    /**
     * Готово ли приложение
     */
    isReady() {
        return this.tg?.isExpanded || false;
    }
    
    /**
     * Открыть ссылку
     */
    openLink(url) {
        if (!this.tg) {
            window.open(url, '_blank');
            return;
        }
        this.tg.openLink(url);
    }
    
    /**
     * Открыть Telegram ссылку
     */
    openTelegramLink(url) {
        if (!this.tg) {
            window.open(url, '_blank');
            return;
        }
        this.tg.openTelegramLink(url);
    }
}

// Экспорт
const telegramApp = new TelegramApp();