/**
 * Admin Masters Module
 * Управление мастерами
 */

import { showToast, showModal, closeModal } from './utils.js';

export class AdminMasters {
    constructor(api) {
        this.api = api;
        this.masters = [];
    }

    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            await this.loadMasters();

            const html = `
                <div class="admin-masters">
                    <div class="page-header">
                        <h1>Управление мастерами</h1>
                        <button class="btn-primary" onclick="adminApp.masters.showCreateModal()">
                            <i class="fas fa-plus"></i> Добавить мастера
                        </button>
                    </div>

                    <div class="masters-grid">
                        ${this.renderMasters()}
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;

        } catch (error) {
            console.error('Ошибка загрузки мастеров:', error);
            showToast('Ошибка загрузки мастеров', 'error');
        }
    }

    async loadMasters() {
        try {
            this.masters = await this.api.request('/api/admin/masters');
        } catch (error) {
            console.error('Ошибка загрузки мастеров:', error);
            this.masters = [];
        }
    }

    renderMasters() {
        if (this.masters.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-user-tie"></i>
                    <h3>Нет мастеров</h3>
                    <p>Добавьте первого мастера</p>
                </div>
            `;
        }

        return this.masters.map(master => `
            <div class="master-card ${master.is_active ? '' : 'inactive'}" onclick="adminApp.masters.showDetails(${master.id})">
                <div class="master-avatar">
                    <img src="${master.photo_url}" alt="${master.name}">
                    ${!master.is_active ? '<div class="inactive-badge">Неактивен</div>' : ''}
                </div>
                <div class="master-info">
                    <h3>${master.name}</h3>
                    <p class="master-specialty">${master.specialty}</p>
                    <div class="master-stats">
                        <span><i class="fas fa-star"></i> ${master.rating.toFixed(1)}</span>
                        <span><i class="fas fa-briefcase"></i> ${master.experience} лет</span>
                        <span><i class="fas fa-comment"></i> ${master.reviews_count}</span>
                    </div>
                </div>
                <button class="btn-icon" onclick="event.stopPropagation(); adminApp.masters.showEditModal(${master.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `).join('');
    }

    async showDetails(masterId) {
        showToast('Детали мастера (в разработке)', 'info');
    }

    async showCreateModal() {
        showToast('Создание мастера (в разработке)', 'info');
    }

    async showEditModal(masterId) {
        showToast('Редактирование мастера (в разработке)', 'info');
    }
}

console.log('✅ AdminMasters модуль загружен');