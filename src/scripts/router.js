/**
 * Простой роутер для SPA
 * 
 * ✅ ИСПРАВЛЕНО:
 * - Убрана рекурсия при "Route not found"
 * - Защита от множественных вызовов navigate
 * - Правильная обработка GitHub Pages префикса
 */
class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.isNavigating = false; // Защита от рекурсии
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
        // ✅ ЗАЩИТА от рекурсии
        if (this.isNavigating) {
            console.warn('Navigation already in progress, skipping:', path);
            return;
        }
        
        // Нормализуем путь
        path = this.normalizePath(path);
        
        // Если уже на этом роуте, ничего не делаем
        if (path === this.currentRoute) {
            console.log('Already on route:', path);
            return;
        }
        
        this.isNavigating = true;
        
        try {
            console.log('🔄 Navigating to:', path);
            
            // Сохраняем в history
            window.history.pushState({}, '', path);
            this.currentRoute = path;
            
            // Ищем совпадение
            const route = this.matchRoute(path);
            
            if (route) {
                console.log('✅ Route found, calling handler');
                route.handler(route.params);
            } else {
                // ✅ НЕ ВЫЗЫВАЕМ navigate('/') - это вызывало рекурсию!
                console.warn('⚠️ Route not found:', path, 'Available routes:', Object.keys(this.routes));
                
                // Просто показываем главную страницу напрямую
                if (this.routes['/']) {
                    console.log('Showing home page as fallback');
                    this.routes['/']({});
                } else {
                    console.error('❌ No home route registered!');
                }
            }
        } finally {
            // Снимаем блокировку
            this.isNavigating = false;
        }
    }
    
    /**
     * Нормализация пути
     */
    normalizePath(path) {
        // Убираем префикс GitHub Pages
        path = path.replace('/beautybook-frontend', '');
        
        // Убираем query string и hash
        path = path.split('?')[0].split('#')[0];
        
        // Убираем trailing slash (кроме корня)
        if (path !== '/' && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        
        // Если путь пустой, ставим /
        if (!path || path === '') {
            path = '/';
        }
        
        return path;
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
        const routeParts = routePath.split('/').filter(p => p);
        const actualParts = actualPath.split('/').filter(p => p);
        
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
        console.log('🚀 Router initialization');
        console.log('Registered routes:', Object.keys(this.routes));
        
        // Обработка кнопки "Назад"
        window.addEventListener('popstate', () => {
            const path = this.normalizePath(window.location.pathname);
            console.log('Popstate event, navigating to:', path);
            
            // Сбрасываем блокировку на случай если застряли
            this.isNavigating = false;
            this.currentRoute = null;
            
            this.navigate(path);
        });
        
        // Загружаем текущий путь
        let currentPath = this.normalizePath(window.location.pathname);
        
        console.log('Initial path:', currentPath);
        
        // Сбрасываем currentRoute чтобы навигация сработала
        this.currentRoute = null;
        
        // Навигируем к текущему пути
        this.navigate(currentPath);
    }
}

// Создаём экземпляр роутера
const router = new Router();

// Экспортируем
export { router };
