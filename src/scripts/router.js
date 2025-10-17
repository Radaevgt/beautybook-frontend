/**
 * Простой роутер для SPA
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.params = {};
    }
    
    /**
     * Зарегистрировать роут
     */
    on(path, handler) {
        this.routes[path] = handler;
    }
    
    /**
     * Перейти на роут
     */
    navigate(path, params = {}) {
        this.params = params;
        this.currentRoute = path;
        
        // Находим обработчик роута
        const handler = this.routes[path];
        
        if (handler) {
            // Скрываем все страницы
            document.querySelectorAll('.page').forEach(page => {
                page.classList.add('hidden');
            });
            
            // Скроллим наверх
            Utils.scrollToTop(false);
            
            // Вызываем обработчик
            handler(params);
            
            // Обновляем активную кнопку в навигации
            this.updateNavigation(path);
        } else {
            console.error(`Роут не найден: ${path}`);
        }
    }
    
    /**
     * Вернуться назад
     */
    back() {
        window.history.back();
    }
    
    /**
     * Обновить активную кнопку навигации
     */
    updateNavigation(path) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            
            const route = item.getAttribute('data-route');
            if (route === path) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * Получить текущий роут
     */
    getCurrentRoute() {
        return this.currentRoute;
    }
    
    /**
     * Получить параметры
     */
    getParams() {
        return this.params;
    }
}

// Создаём экземпляр роутера
const router = new Router();