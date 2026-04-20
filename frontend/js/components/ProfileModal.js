import { getCurrentUser } from '../services/storageService.js';
import { getUserSettings, saveUserSettings, THEMES, FONT_SIZES, updateSetting } from '../services/themeService.js';
import { getUserRegisteredHackathons, cancelRegistration } from '../services/profileService.js';
import { updateUserProfileData } from '../services/profileService.js';

export class ProfileModal {
    constructor(userId, onUpdate) {
        this.userId = userId;
        this.onUpdate = onUpdate;
        this.currentUser = getCurrentUser();
        this.settings = getUserSettings(userId);
        this.registeredHackathons = getUserRegisteredHackathons(userId);
        this.isEditing = false;
        this.currentTab = 'profile';
    }
    
    render() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2><i class="fas fa-user-circle"></i> Профиль пользователя</h2>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-tabs">
                    <button class="modal-tab ${this.currentTab === 'profile' ? 'active' : ''}" data-tab="profile">👤 Профиль</button>
                    <button class="modal-tab ${this.currentTab === 'hackathons' ? 'active' : ''}" data-tab="hackathons">🏆 Мои хакатоны (${this.registeredHackathons.length})</button>
                    <button class="modal-tab ${this.currentTab === 'settings' ? 'active' : ''}" data-tab="settings">⚙️ Настройки</button>
                </div>
                
                <div class="modal-content">
                    <div id="profileTab" class="tab-content ${this.currentTab === 'profile' ? 'active' : ''}">
                        ${this.renderProfileContent()}
                    </div>
                    <div id="hackathonsTab" class="tab-content ${this.currentTab === 'hackathons' ? 'active' : ''}">
                        ${this.renderHackathonsContent()}
                    </div>
                    <div id="settingsTab" class="tab-content ${this.currentTab === 'settings' ? 'active' : ''}">
                        ${this.renderSettingsContent()}
                    </div>
                </div>
            </div>
        `;
        
        this.modal = modal;
        this.attachEvents();
        return modal;
    }
    
    renderProfileContent() {
        if (this.isEditing) {
            return `
                <h3>Редактирование профиля</h3>
                <div class="profile-form">
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Имя пользователя</label>
                        <input type="text" id="editName" value="${this.escapeHtml(this.currentUser?.name || '')}">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" id="editEmail" value="${this.escapeHtml(this.currentUser?.email || '')}" disabled>
                        <small>Email нельзя изменить</small>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-city"></i> Город</label>
                        <input type="text" id="editCity" value="${this.escapeHtml(this.currentUser?.city || '')}" placeholder="Ваш город">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-code"></i> Навыки (через запятую)</label>
                        <input type="text" id="editSkills" value="${this.escapeHtml((this.currentUser?.skills || []).join(', '))}" placeholder="JavaScript, Python, React...">
                    </div>
                    <div class="profile-actions">
                        <button class="save-profile-btn" id="saveProfileBtn"><i class="fas fa-save"></i> Сохранить</button>
                        <button class="cancel-edit-btn" id="cancelEditBtn"><i class="fas fa-times"></i> Отмена</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="profile-info">
                <div class="profile-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="profile-details">
                    <h3>${this.escapeHtml(this.currentUser?.name || 'Пользователь')}</h3>
                    <p><i class="fas fa-envelope"></i> ${this.escapeHtml(this.currentUser?.email || '')}</p>
                    <p><i class="fas fa-city"></i> ${this.escapeHtml(this.currentUser?.city || 'Город не указан')}</p>
                    <p><i class="fas fa-code"></i> Навыки: ${this.escapeHtml((this.currentUser?.skills || []).join(', ') || 'Не указаны')}</p>
                    <p><i class="fas fa-calendar-alt"></i> Зарегистрирован: ${new Date(this.currentUser?.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="profile-actions">
                <button class="edit-profile-btn" id="editProfileBtn"><i class="fas fa-edit"></i> Редактировать профиль</button>
            </div>
        `;
    }
    
    renderHackathonsContent() {
        if (this.registeredHackathons.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt"></i>
                    <p>Вы еще не записались ни на один хакатон</p>
                    <small>Перейдите на главную страницу и выберите хакатон для участия</small>
                </div>
            `;
        }
        
        return `
            <div class="registered-hackathons">
                ${this.registeredHackathons.map(hack => `
                    <div class="registered-card">
                        <div class="registered-header">
                            <h4>${this.escapeHtml(hack.title)}</h4>
                            <span class="status-badge status-${hack.status}">
                                ${hack.status === 'pending' ? 'На рассмотрении' : hack.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                            </span>
                        </div>
                        <div class="registered-dates">
                            <i class="far fa-calendar-alt"></i> ${hack.startDate} — ${hack.endDate}
                        </div>
                        <div class="registered-tech">
                            ${(hack.tech || []).map(t => `<span class="tech-tag">${this.escapeHtml(t)}</span>`).join('')}
                        </div>
                        <div class="registered-actions">
                            <button class="cancel-registration-btn" data-id="${hack.id}">
                                <i class="fas fa-times-circle"></i> Отменить запись
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    renderSettingsContent() {
        return `
            <div class="settings-group">
                <h3><i class="fas fa-palette"></i> Оформление</h3>
                <div class="setting-item">
                    <label>Тема</label>
                    <div class="theme-buttons">
                        <button class="theme-btn ${this.settings.theme === THEMES.LIGHT ? 'active' : ''}" data-theme="${THEMES.LIGHT}">
                            <i class="fas fa-sun"></i> Светлая
                        </button>
                        <button class="theme-btn ${this.settings.theme === THEMES.DARK ? 'active' : ''}" data-theme="${THEMES.DARK}">
                            <i class="fas fa-moon"></i> Тёмная
                        </button>
                    </div>
                </div>
                
                <div class="setting-item">
                    <label>Размер шрифта</label>
                    <div class="font-buttons">
                        <button class="font-btn ${this.settings.fontSize === FONT_SIZES.SMALL ? 'active' : ''}" data-font="${FONT_SIZES.SMALL}">
                            Маленький
                        </button>
                        <button class="font-btn ${this.settings.fontSize === FONT_SIZES.MEDIUM ? 'active' : ''}" data-font="${FONT_SIZES.MEDIUM}">
                            Средний
                        </button>
                        <button class="font-btn ${this.settings.fontSize === FONT_SIZES.LARGE ? 'active' : ''}" data-font="${FONT_SIZES.LARGE}">
                            Большой
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="settings-group">
                <h3><i class="fas fa-bell"></i> Уведомления</h3>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="notificationsToggle" ${this.settings.notifications ? 'checked' : ''}>
                        Получать уведомления о новых хакатонах
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="compactViewToggle" ${this.settings.compactView ? 'checked' : ''}>
                        Компактный вид карточек
                    </label>
                </div>
            </div>
        `;
    }
    
    attachEvents() {
        // Закрытие модального окна
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.modal.remove());
        }
        
        // Переключение табов
        const tabs = this.modal.querySelectorAll('.modal-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = tab.dataset.tab;
                this.currentTab = tabName;
                
                // Обновляем активный таб
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Показываем нужный контент
                const profileTab = this.modal.querySelector('#profileTab');
                const hackathonsTab = this.modal.querySelector('#hackathonsTab');
                const settingsTab = this.modal.querySelector('#settingsTab');
                
                profileTab.classList.remove('active');
                hackathonsTab.classList.remove('active');
                settingsTab.classList.remove('active');
                
                if (tabName === 'profile') {
                    profileTab.classList.add('active');
                } else if (tabName === 'hackathons') {
                    hackathonsTab.classList.add('active');
                } else if (tabName === 'settings') {
                    settingsTab.classList.add('active');
                }
            });
        });
        
        // Кнопка редактирования профиля
        const editBtn = this.modal.querySelector('#editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.isEditing = true;
                this.refreshModal();
            });
        }
        
        // Кнопка сохранения профиля
        const saveBtn = this.modal.querySelector('#saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const newName = this.modal.querySelector('#editName')?.value || '';
                const newCity = this.modal.querySelector('#editCity')?.value || '';
                const skillsStr = this.modal.querySelector('#editSkills')?.value || '';
                const newSkills = skillsStr ? skillsStr.split(',').map(s => s.trim()) : [];
                
                const result = updateUserProfileData(this.userId, {
                    name: newName,
                    city: newCity,
                    skills: newSkills
                });
                
                if (result.success) {
                    this.isEditing = false;
                    this.currentUser = getCurrentUser();
                    if (this.onUpdate) this.onUpdate();
                    this.refreshModal();
                    this.showNotification('Профиль успешно обновлен!', true);
                } else {
                    this.showNotification('Ошибка при сохранении профиля', false);
                }
            });
        }
        
        // Кнопка отмены редактирования
        const cancelBtn = this.modal.querySelector('#cancelEditBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.isEditing = false;
                this.refreshModal();
            });
        }
        
        // Настройки темы
        const themeBtns = this.modal.querySelectorAll('.theme-btn');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                updateSetting(this.userId, 'theme', theme);
                this.settings = getUserSettings(this.userId);
                this.refreshModal();
                if (this.onUpdate) this.onUpdate();
            });
        });
        
        // Настройки шрифта
        const fontBtns = this.modal.querySelectorAll('.font-btn');
        fontBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const fontSize = btn.dataset.font;
                updateSetting(this.userId, 'fontSize', fontSize);
                this.settings = getUserSettings(this.userId);
                this.refreshModal();
                if (this.onUpdate) this.onUpdate();
            });
        });
        
        // Уведомления
        const notifToggle = this.modal.querySelector('#notificationsToggle');
        if (notifToggle) {
            notifToggle.addEventListener('change', (e) => {
                updateSetting(this.userId, 'notifications', e.target.checked);
                this.settings = getUserSettings(this.userId);
            });
        }
        
        // Компактный вид
        const compactToggle = this.modal.querySelector('#compactViewToggle');
        if (compactToggle) {
            compactToggle.addEventListener('change', (e) => {
                updateSetting(this.userId, 'compactView', e.target.checked);
                this.settings = getUserSettings(this.userId);
                if (this.onUpdate) this.onUpdate();
            });
        }
        
        // Отмена регистрации
        const cancelBtns = this.modal.querySelectorAll('.cancel-registration-btn');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hackId = parseInt(btn.dataset.id);
                if (confirm('Вы уверены, что хотите отменить запись на хакатон?')) {
                    cancelRegistration(this.userId, hackId);
                    this.registeredHackathons = getUserRegisteredHackathons(this.userId);
                    this.refreshModal();
                    if (this.onUpdate) this.onUpdate();
                    this.showNotification('Запись на хакатон отменена', true);
                }
            });
        });
        
        // Клик вне модального окна для закрытия
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.modal.remove();
            }
        });
    }
    
    showNotification(message, isSuccess) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'notification-success' : 'notification-error'}`;
        notification.innerHTML = `
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    refreshModal() {
        const newModal = new ProfileModal(this.userId, this.onUpdate);
        const newElement = newModal.render();
        this.modal.parentNode.replaceChild(newElement, this.modal);
    }
    
    escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }
}