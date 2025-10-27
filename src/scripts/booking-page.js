/**
 * ==============================================
 * СТРАНИЦА "МОИ ЗАПИСИ"
 * ==============================================
 * 
 * Функционал:
 * - Отображение всех записей пользователя
 * - Фильтрация по статусам (Активные/Завершенные/Отмененные)
 * - Отмена активных записей
 * - Красивые карточки с полной информацией
 */

/**
 * Отобразить страницу "Мои записи"
 */
async function renderMyBookingsPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="page">
            <div class="header">
                <button class="back-button" onclick="router.navigate('/home')">←</button>
                <h1>Мои записи</h1>
            </div>
            
            <!-- Фильтры по статусам -->
            <div class="filter-tabs">
                <button class="filter-tab active" data-status="all">
                    Все
                </button>
                <button class="filter-tab" data-status="confirmed">
                    Активные
                </button>
                <button class="filter-tab" data-status="completed">
                    Завершенные
                </button>
                <button class="filter-tab" data-status="cancelled">
                    Отмененные
                </button>
            </div>
            
            <!-- Контейнер для загрузки -->
            <div class="content">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Загрузка записей...</p>
                </div>
            </div>
            
            ${renderBottomNav('bookings')}
        </div>
    `;
    
    // Загружаем записи
    await loadBookings('all');
    
    // Добавляем обработчики фильтров
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // Убираем активный класс со всех табов
            filterTabs.forEach(t => t.classList.remove('active'));
            // Добавляем активный класс на выбранный таб
            tab.classList.add('active');
            
            const status = tab.dataset.status;
            await loadBookings(status);
        });
    });
}

/**
 * Загрузить записи с сервера
 */
async function loadBookings(status) {
    const content = document.querySelector('.content');
    
    try {
        // Показываем индикатор загрузки
        content.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Загрузка записей...</p>
            </div>
        `;
        
        // Формируем URL с фильтром
        let url = `${API_BASE_URL}/bookings/my`;
        if (status && status !== 'all') {
            url += `?status=${status}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true'
            }
        });
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки записей');
        }
        
        const bookings = await response.json();
        
        // Отображаем записи или пустое состояние
        if (bookings.length === 0) {
            content.innerHTML = renderEmptyState(status);
        } else {
            content.innerHTML = renderBookingsList(bookings);
            
            // Добавляем обработчики кнопок отмены
            addCancelHandlers();
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        content.innerHTML = `
            <div class="error-message">
                <p>❌ Не удалось загрузить записи</p>
                <p class="error-details">${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    Попробовать снова
                </button>
            </div>
        `;
    }
}

/**
 * Отрисовать список записей
 */
function renderBookingsList(bookings) {
    return `
        <div class="bookings-list">
            ${bookings.map(booking => renderBookingCard(booking)).join('')}
        </div>
    `;
}

/**
 * Отрисовать карточку записи
 */
function renderBookingCard(booking) {
    const statusLabels = {
        'confirmed': { text: 'Активная', class: 'status-confirmed', icon: '✓' },
        'completed': { text: 'Завершена', class: 'status-completed', icon: '✓' },
        'cancelled': { text: 'Отменена', class: 'status-cancelled', icon: '✕' }
    };
    
    const status = statusLabels[booking.status] || { text: booking.status, class: '', icon: '•' };
    
    // Форматируем дату
    const bookingDate = new Date(booking.date);
    const dateStr = bookingDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Получаем имя мастера
    const masterName = booking.master?.name || 'Мастер не указан';
    
    // Получаем название услуги
    const serviceName = booking.service?.name || 'Услуга не указана';
    
    return `
        <div class="booking-card ${status.class}">
            <!-- Статус -->
            <div class="booking-status">
                <span class="status-badge ${status.class}">
                    ${status.icon} ${status.text}
                </span>
            </div>
            
            <!-- Основная информация -->
            <div class="booking-info">
                <div class="booking-row">
                    <span class="booking-icon">👤</span>
                    <div class="booking-details">
                        <strong>Мастер:</strong>
                        <span>${masterName}</span>
                    </div>
                </div>
                
                <div class="booking-row">
                    <span class="booking-icon">✂️</span>
                    <div class="booking-details">
                        <strong>Услуга:</strong>
                        <span>${serviceName}</span>
                    </div>
                </div>
                
                <div class="booking-row">
                    <span class="booking-icon">📅</span>
                    <div class="booking-details">
                        <strong>Дата:</strong>
                        <span>${dateStr}</span>
                    </div>
                </div>
                
                <div class="booking-row">
                    <span class="booking-icon">🕐</span>
                    <div class="booking-details">
                        <strong>Время:</strong>
                        <span>${booking.time_start} - ${booking.time_end}</span>
                    </div>
                </div>
                
                <div class="booking-row">
                    <span class="booking-icon">💰</span>
                    <div class="booking-details">
                        <strong>Стоимость:</strong>
                        <span>${booking.price} ₽</span>
                    </div>
                </div>
                
                ${booking.comment ? `
                <div class="booking-row">
                    <span class="booking-icon">📝</span>
                    <div class="booking-details">
                        <strong>Комментарий:</strong>
                        <span>${booking.comment}</span>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <!-- Действия -->
            ${booking.status === 'confirmed' ? `
                <div class="booking-actions">
                    <button class="btn btn-danger cancel-booking-btn" data-booking-id="${booking.id}">
                        Отменить запись
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Отрисовать пустое состояние
 */
function renderEmptyState(status) {
    const messages = {
        'all': {
            icon: '📅',
            title: 'У вас пока нет записей',
            text: 'Создайте первую запись, выбрав мастера и услугу'
        },
        'confirmed': {
            icon: '✓',
            title: 'Нет активных записей',
            text: 'Все ваши записи завершены или отменены'
        },
        'completed': {
            icon: '✓',
            title: 'Нет завершенных записей',
            text: 'Здесь появятся записи после их выполнения'
        },
        'cancelled': {
            icon: '✕',
            title: 'Нет отмененных записей',
            text: 'У вас нет отмененных записей'
        }
    };
    
    const message = messages[status] || messages['all'];
    
    return `
        <div class="empty-state">
            <div class="empty-icon">${message.icon}</div>
            <h2>${message.title}</h2>
            <p>${message.text}</p>
            ${status === 'all' ? `
                <button class="btn btn-primary" onclick="router.navigate('/masters')">
                    Записаться на услугу
                </button>
            ` : ''}
        </div>
    `;
}

/**
 * Добавить обработчики кнопок отмены
 */
function addCancelHandlers() {
    const cancelButtons = document.querySelectorAll('.cancel-booking-btn');
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const bookingId = button.dataset.bookingId;
            
            // Подтверждение отмены
            const confirmed = confirm('Вы уверены, что хотите отменить эту запись?');
            
            if (!confirmed) {
                return;
            }
            
            // Показываем индикатор загрузки
            button.disabled = true;
            button.textContent = 'Отменяем...';
            
            try {
                const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                    method: 'DELETE',
                    headers: {
                        'ngrok-skip-browser-warning': 'true'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Не удалось отменить запись');
                }
                
                // Успешно отменили - перезагружаем список
                showSuccessToast('Запись успешно отменена');
                
                // Определяем текущий активный фильтр
                const activeTab = document.querySelector('.filter-tab.active');
                const currentStatus = activeTab ? activeTab.dataset.status : 'all';
                
                // Перезагружаем записи
                await loadBookings(currentStatus);
                
            } catch (error) {
                console.error('Ошибка отмены записи:', error);
                showErrorToast('Не удалось отменить запись. Попробуйте позже.');
                
                // Восстанавливаем кнопку
                button.disabled = false;
                button.textContent = 'Отменить запись';
            }
        });
    });
}

/**
 * Показать уведомление об успехе
 */
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Показать уведомление об ошибке
 */
function showErrorToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Отрисовать нижнюю навигацию
 */
function renderBottomNav(currentPage) {
    return `
        <nav class="bottom-nav">
            <a href="#" class="nav-item ${currentPage === 'home' ? 'active' : ''}" 
               onclick="event.preventDefault(); router.navigate('/home')">
                <span class="nav-icon">🏠</span>
                <span class="nav-label">Главная</span>
            </a>
            <a href="#" class="nav-item ${currentPage === 'masters' ? 'active' : ''}" 
               onclick="event.preventDefault(); router.navigate('/masters')">
                <span class="nav-icon">👥</span>
                <span class="nav-label">Мастера</span>
            </a>
            <a href="#" class="nav-item ${currentPage === 'bookings' ? 'active' : ''}" 
               onclick="event.preventDefault(); router.navigate('/bookings')">
                <span class="nav-icon">📅</span>
                <span class="nav-label">Записи</span>
            </a>
        </nav>
    `;
}
