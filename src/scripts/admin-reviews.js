/**
 * Admin Reviews Module
 * Модерация отзывов
 */

import { showToast, showModal, closeModal } from './utils.js';

export class AdminReviews {
    constructor(api) {
        this.api = api;
        this.reviews = [];
        this.filter = 'pending'; // pending, published, all
    }

    async render() {
        document.getElementById('app').innerHTML = '<div class="loading"><div class="spinner"></div></div>';

        try {
            await this.loadReviews();

            const html = `
                <div class="admin-reviews">
                    <div class="page-header">
                        <h1>Модерация отзывов</h1>
                    </div>

                    <div class="review-filters">
                        <button class="filter-btn ${this.filter === 'pending' ? 'active' : ''}" 
                                onclick="adminApp.reviews.setFilter('pending')">
                            Ожидают модерации
                        </button>
                        <button class="filter-btn ${this.filter === 'published' ? 'active' : ''}"
                                onclick="adminApp.reviews.setFilter('published')">
                            Опубликованные
                        </button>
                        <button class="filter-btn ${this.filter === 'all' ? 'active' : ''}"
                                onclick="adminApp.reviews.setFilter('all')">
                            Все отзывы
                        </button>
                    </div>

                    <div class="reviews-list">
                        ${this.renderReviews()}
                    </div>
                </div>
            `;

            document.getElementById('app').innerHTML = html;

        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            showToast('Ошибка загрузки отзывов', 'error');
        }
    }

    async loadReviews() {
        try {
            const params = this.filter !== 'all' ? `?is_published=${this.filter === 'published'}` : '';
            this.reviews = await this.api.request(`/api/admin/reviews${params}`);
        } catch (error) {
            this.reviews = [];
        }
    }

    renderReviews() {
        if (this.reviews.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <h3>Нет отзывов</h3>
                </div>
            `;
        }

        return this.reviews.map(review => `
            <div class="review-card ${review.is_published ? '' : 'pending'}">
                <div class="review-header">
                    <div class="review-author">
                        <i class="fas fa-user-circle"></i>
                        <span>${review.client.name}</span>
                    </div>
                    <div class="review-rating">
                        ${this.renderStars(review.rating)}
                    </div>
                </div>

                <div class="review-meta">
                    <span><i class="fas fa-user-tie"></i> ${review.master.name}</span>
                    <span><i class="fas fa-scissors"></i> ${review.service.name}</span>
                </div>

                ${review.comment ? `<p class="review-text">${review.comment}</p>` : ''}

                <div class="review-actions">
                    ${!review.is_published ? `
                        <button class="btn-success btn-sm" onclick="adminApp.reviews.publish(${review.id})">
                            <i class="fas fa-check"></i> Опубликовать
                        </button>
                        <button class="btn-danger btn-sm" onclick="adminApp.reviews.hide(${review.id})">
                            <i class="fas fa-times"></i> Скрыть
                        </button>
                    ` : `
                        <button class="btn-secondary btn-sm" onclick="adminApp.reviews.hide(${review.id})">
                            <i class="fas fa-eye-slash"></i> Снять с публикации
                        </button>
                    `}
                    <button class="btn-link btn-sm" onclick="adminApp.reviews.reply(${review.id})">
                        <i class="fas fa-reply"></i> Ответить
                    </button>
                </div>

                ${review.admin_response ? `
                    <div class="review-response">
                        <i class="fas fa-reply"></i>
                        <div>
                            <strong>Ответ администратора:</strong>
                            <p>${review.admin_response}</p>
                        </div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="fas fa-star ${i <= rating ? 'active' : ''}"></i>`;
        }
        return html;
    }

    async setFilter(filter) {
        this.filter = filter;
        this.render();
    }

    async publish(reviewId) {
        try {
            await this.api.request(`/api/admin/reviews/${reviewId}/publish`, { method: 'PATCH' });
            showToast('Отзыв опубликован', 'success');
            this.render();
        } catch (error) {
            showToast('Ошибка публикации', 'error');
        }
    }

    async hide(reviewId) {
        try {
            await this.api.request(`/api/admin/reviews/${reviewId}/hide`, { method: 'PATCH' });
            showToast('Отзыв скрыт', 'success');
            this.render();
        } catch (error) {
            showToast('Ошибка', 'error');
        }
    }

    async reply(reviewId) {
        showToast('Ответ на отзыв (в разработке)', 'info');
    }
}

console.log('✅ AdminReviews модуль загружен');