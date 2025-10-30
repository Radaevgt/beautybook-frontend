/**
 * Admin Stats Module
 * Статистика и аналитика
 */

import { showToast } from './utils.js';

export class AdminStats {
    constructor(api) {
        this.api = api;
        this.period = 30; // дней
        this.dateFrom = null;
        this.dateTo = null;
    }

    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            // Устанавливаем период по умолчанию
            if (!this.dateFrom || !this.dateTo) {
                this.dateTo = new Date().toISOString().split('T')[0];
                const from = new Date();
                from.setDate(from.getDate() - this.period);
                this.dateFrom = from.toISOString().split('T')[0];
            }

            const [periodStats, mastersStats, servicesStats, chartData] = await Promise.all([
                this.loadPeriodStats(),
                this.loadMastersStats(),
                this.loadServicesStats(),
                this.loadChartData()
            ]);

            const html = `
                <div class="admin-stats">
                    <div class="page-header">
                        <h1>Статистика</h1>
                    </div>

                    <!-- Выбор периода -->
                    <div class="period-selector">
                        <button class="period-btn ${this.period === 7 ? 'active' : ''}" onclick="adminApp.stats.setPeriod(7)">
                            Неделя
                        </button>
                        <button class="period-btn ${this.period === 30 ? 'active' : ''}" onclick="adminApp.stats.setPeriod(30)">
                            Месяц
                        </button>
                        <button class="period-btn ${this.period === 90 ? 'active' : ''}" onclick="adminApp.stats.setPeriod(90)">
                            3 месяца
                        </button>
                    </div>

                    <!-- Общая статистика -->
                    <div class="stats-summary">
                        <div class="stat-box">
                            <div class="stat-icon" style="background: #4CAF50;">
                                <i class="fas fa-calendar-check"></i>
                            </div>
                            <div class="stat-data">
                                <div class="stat-value">${periodStats.bookings.total}</div>
                                <div class="stat-label">Записей</div>
                                <div class="stat-breakdown">
                                    Завершено: ${periodStats.bookings.completed} • 
                                    Отменено: ${periodStats.bookings.cancelled}
                                </div>
                            </div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-icon" style="background: #2196F3;">
                                <i class="fas fa-ruble-sign"></i>
                            </div>
                            <div class="stat-data">
                                <div class="stat-value">${periodStats.revenue.total.toLocaleString()} ₽</div>
                                <div class="stat-label">Выручка</div>
                                <div class="stat-breakdown">
                                    Средний чек: ${periodStats.revenue.average_check} ₽
                                </div>
                            </div>
                        </div>

                        <div class="stat-box">
                            <div class="stat-icon" style="background: #FF9800;">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="stat-data">
                                <div class="stat-value">${periodStats.clients.new_clients}</div>
                                <div class="stat-label">Новых клиентов</div>
                                <div class="stat-breakdown">
                                    Повторные: ${periodStats.clients.repeat_clients}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- График записей -->
                    <div class="chart-container">
                        <h2>Динамика записей</h2>
                        <canvas id="bookings-chart"></canvas>
                    </div>

                    <!-- Топ мастеров -->
                    <div class="stats-section">
                        <h2>Топ мастеров</h2>
                        <div class="top-list">
                            ${this.renderTopMasters(mastersStats)}
                        </div>
                    </div>

                    <!-- Популярные услуги -->
                    <div class="stats-section">
                        <h2>Популярные услуги</h2>
                        <div class="top-list">
                            ${this.renderTopServices(servicesStats)}
                        </div>
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;

            // Отрисовываем график
            this.renderChart(chartData);

        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            showToast('Ошибка загрузки статистики', 'error');
        }
    }

    async loadPeriodStats() {
        try {
            return await this.api.request(`/api/admin/stats/period?date_from=${this.dateFrom}&date_to=${this.dateTo}`);
        } catch (error) {
            return {
                bookings: { total: 0, completed: 0, cancelled: 0 },
                revenue: { total: 0, average_check: 0 },
                clients: { new_clients: 0, repeat_clients: 0 }
            };
        }
    }

    async loadMastersStats() {
        try {
            return await this.api.request(`/api/admin/stats/masters?date_from=${this.dateFrom}&date_to=${this.dateTo}`);
        } catch (error) {
            return [];
        }
    }

    async loadServicesStats() {
        try {
            return await this.api.request(`/api/admin/stats/services?date_from=${this.dateFrom}&date_to=${this.dateTo}`);
        } catch (error) {
            return [];
        }
    }

    async loadChartData() {
        try {
            return await this.api.request(`/api/admin/stats/chart/bookings?days=${this.period}`);
        } catch (error) {
            return { data: [] };
        }
    }

    renderTopMasters(masters) {
        if (masters.length === 0) {
            return '<p class="text-muted">Нет данных</p>';
        }

        return masters.slice(0, 5).map((master, index) => `
            <div class="top-item">
                <div class="top-rank">${index + 1}</div>
                <div class="top-info">
                    <div class="top-name">${master.name}</div>
                    <div class="top-meta">
                        ${master.completed_bookings} записей • 
                        ${master.total_revenue.toLocaleString()} ₽ • 
                        ⭐ ${master.average_rating.toFixed(1)}
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderTopServices(services) {
        if (services.length === 0) {
            return '<p class="text-muted">Нет данных</p>';
        }

        return services.slice(0, 5).map((service, index) => `
            <div class="top-item">
                <div class="top-rank">${index + 1}</div>
                <div class="top-info">
                    <div class="top-name">${service.name}</div>
                    <div class="top-meta">
                        ${service.bookings_count} записей • 
                        ${service.total_revenue.toLocaleString()} ₽ • 
                        ${service.price} ₽/услуга
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderChart(chartData) {
        const ctx = document.getElementById('bookings-chart');
        if (!ctx) return;

        const data = chartData.data || [];
        const labels = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        });
        const values = data.map(d => d.count);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Записи',
                    data: values,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    setPeriod(days) {
        this.period = days;
        this.dateFrom = null;
        this.dateTo = null;
        this.render();
    }
}

console.log('✅ AdminStats модуль загружен');