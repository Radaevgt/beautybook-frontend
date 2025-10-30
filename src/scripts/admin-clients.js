/**
 * Admin Clients Module  
 * CRM - управление клиентами
 */

import { showToast } from './utils.js';

export class AdminClients {
    constructor(api) {
        this.api = api;
        this.clients = [];
    }

    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            await this.loadClients();

            const html = `
                <div class="admin-clients">
                    <div class="page-header">
                        <h1>CRM Клиентов</h1>
                    </div>

                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="search" id="client-search" placeholder="Поиск по имени, телефону...">
                    </div>

                    <div class="clients-list">
                        ${this.renderClients()}
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;

        } catch (error) {
            console.error('Ошибка загрузки клиентов:', error);
            showToast('Ошибка загрузки клиентов', 'error');
        }
    }

    async loadClients() {
        try {
            this.clients = await this.api.request('/api/admin/clients');
        } catch (error) {
            this.clients = [];
        }
    }

    renderClients() {
        if (this.clients.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <h3>Нет клиентов</h3>
                </div>
            `;
        }

        return this.clients.map(client => `
            <div class="client-card" onclick="adminApp.clients.showProfile(${client.id})">
                <div class="client-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="client-info">
                    <h3>${client.first_name || ''} ${client.last_name || ''}</h3>
                    <p class="client-phone">${client.phone || '-'}</p>
                    ${client.username ? `<p class="client-username">@${client.username}</p>` : ''}
                </div>
                <div class="client-stats">
                    <div class="stat-item">
                        <span class="stat-value">${client.total_visits || 0}</span>
                        <span class="stat-label">визитов</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${client.total_spent || 0} ₽</span>
                        <span class="stat-label">потрачено</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async showProfile(clientId) {
        showToast('Профиль клиента (в разработке)', 'info');
    }
}

console.log('✅ AdminClients модуль загружен');