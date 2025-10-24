/**
 * Простой роутер для SPA
 */

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
    }
    
    /**
     * Зарегистрировать роут
     */
    on(path, handler) {
        this.routes[path] = handler;
    }
    
    /**
     * Навигация к роуту
     */
    navigate(path) {
        // Сохраняем в history
        if (path !== this.currentRoute) {
            window.history.pushState({}, '', path);
            this.currentRoute = path;
        }
        
        // Ищем совпадение
        const route = this.matchRoute(path);
        
        if (route) {
            route.handler(route.params);
        } else {
            console.warn('Route not found:', path);
            // Перенаправляем на главную
            this.navigate('/');
        }
    }
    
    /**
     * Найти совпадающий роут
     */
    matchRoute(path) {
        // Проверяем точное совпадение
        if (this.routes[path]) {
            return {
                handler: this.routes[path],
                params: {}
            };
        }
        
        // Проверяем параметризованные роуты
        for (const routePath in this.routes) {
            const params = this.matchParams(routePath, path);
            if (params) {
                return {
                    handler: this.routes[routePath],
                    params: params
                };
            }
        }
        
        return null;
    }
    
    /**
     * Извлечь параметры из пути
     */
    matchParams(routePath, actualPath) {
        const routeParts = routePath.split('/');
        const actualParts = actualPath.split('/');
        
        if (routeParts.length !== actualParts.length) {
            return null;
        }
        
        const params = {};
        
        for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(':')) {
                // Это параметр
                const paramName = routeParts[i].substring(1);
                params[paramName] = actualParts[i];
            } else if (routeParts[i] !== actualParts[i]) {
                // Не совпадает
                return null;
            }
        }
        
        return params;
    }
    
    /**
     * Инициализация роутера
     */
    init() {
        // Обработка кнопки "Назад"
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname);
        });
        
        // Загружаем текущий путь
        let currentPath = window.location.pathname;
        
        // Убираем префикс GitHub Pages
        currentPath = currentPath.replace('/beautybook-frontend', '');
        
        // Если путь пустой, ставим /
        if (!currentPath || currentPath === '/') {
            currentPath = '/';
        }
        
        this.navigate(currentPath);
}
}

// Создаём экземпляр роутера
const router = new Router();

// Экспортируем
export { router };
