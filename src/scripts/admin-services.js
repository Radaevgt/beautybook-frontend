/**
 * Admin Services Module
 * Управление услугами
 */

import { showToast } from './utils.js';

export class AdminServices {
    constructor(api) {
        this.api = api;
        this.services = [];
        this.categories = [];
    }

    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            await Promise.all([this.loadServices(), this.loadCategories()]);

            const html = `
                <div class="admin-services">
                    <div class="page-header">
                        <h1>Управление услугами</h1>
                        <button class="btn-primary" onclick="adminApp.services.showCreateModal()">
                            <i class="fas fa-plus"></i> Новая услуга
                        </button>
                    </div>

                    ${this.renderByCategories()}
                </div>
            `;

            document.getElementById('app').innerHTML = html;

        } catch (error) {
            console.error('Ошибка загрузки услуг:', error);
            showToast('Ошибка загрузки услуг', 'error');
        }
    }

    async loadServices() {
        try {
            this.services = await this.api.request('/api/admin/services');
        } catch (error) {
            this.services = [];
        }
    }

    async loadCategories() {
        try {
            this.categories = await this.api.request('/api/admin/services/categories');
        } catch (error) {
            this.categories = [];
        }
    }

    renderByCategories() {
        if (this.services.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-scissors"></i>
                    <h3>Нет услуг</h3>
                    <p>Добавьте первую услугу</p>
                </div>
            `;
        }

        const grouped = this.groupByCategory();

        return Object.keys(grouped).map(categoryId => {
            const category = this.categories.find(c => c.id == categoryId) || { name: 'Без категории' };
            const services = grouped[categoryId];

            return `
                <div class="services-category">
                    <h2>${category.name}</h2>
                    <div class="services-list">
                        ${services.map(service => this.renderServiceCard(service)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    renderServiceCard(service) {
        return `
            <div class="service-card ${service.is_active ? '' : 'inactive'}" onclick="adminApp.services.showDetails(${service.id})">
                <div class="service-info">
                    <h3>${service.name}</h3>
                    <p>${service.description || ''}</p>
                    <div class="service-meta">
                        <span class="service-price">${service.price} ₽</span>
                        <span class="service-duration"><i class="fas fa-clock"></i> ${service.duration} мин</span>
                        ${!service.is_active ? '<span class="badge-inactive">Неактивна</span>' : ''}
                    </div>
                </div>
                <button class="btn-icon" onclick="event.stopPropagation(); adminApp.services.showEditModal(${service.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    groupByCategory() {
        return this.services.reduce((groups, service) => {
            const categoryId = service.category_id || 'null';
            if (!groups[categoryId]) {
                groups[categoryId] = [];
            }
            groups[categoryId].push(service);
            return groups;
        }, {});
    }

    async showDetails(serviceId) {
        showToast('Детали услуги (в разработке)', 'info');
    }

    async showCreateModal() {
        showToast('Создание услуги (в разработке)', 'info');
    }

    async showEditModal(serviceId) {
        showToast('Редактирование услуги (в разработке)', 'info');
    }
}

console.log('✅ AdminServices модуль загружен');