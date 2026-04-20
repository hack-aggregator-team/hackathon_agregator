import { getCurrentUser, logoutUser } from '../services/storageService.js';
import { mockHackathons, filterHackathons } from '../../data/mockHackathons.js';
import { HackathonCard } from './hackathonCard.js';
import { CalendarView } from './CalendarView.js';

export class MainApp {
    constructor() {
        this.currentUser = getCurrentUser();
        this.currentView = 'list'; // 'list' or 'calendar'
        this.filters = {
            dateFrom: '',
            dateTo: '',
            difficulty: 'all',
            searchText: '',
            format: 'all'
        };
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'main-screen';
        container.style.display = 'block';
        
        container.innerHTML = `
            <div class="navbar">
                <div class="logo">🚀 <span>Хакатон</span>Агрегатор</div>
                <div class="user-info">
                    <div class="user-greeting" id="userNameBtn">
                        <i class="fas fa-user-circle"></i> 👋 ${this.escapeHtml(this.currentUser?.name || 'Пользователь')}
                    </div>
                    <button class="logout-btn" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Выйти</button>
                </div>
            </div>
            
            <div class="view-toggle">
                <button class="view-btn ${this.currentView === 'list' ? 'active' : ''}" data-view="list">
                    <i class="fas fa-list"></i> Список
                </button>
                <button class="view-btn ${this.currentView === 'calendar' ? 'active' : ''}" data-view="calendar">
                    <i class="fas fa-calendar-alt"></i> Календарь
                </button>
            </div>
            
            <div id="listView" style="${this.currentView === 'list' ? 'display:block' : 'display:none'}">
                <div class="filters-bar">
                    <div class="filter-group">
                        <label><i class="far fa-calendar-alt"></i> Дата от</label>
                        <input type="date" id="filterDateFrom" value="${this.filters.dateFrom}">
                    </div>
                    <div class="filter-group">
                        <label><i class="far fa-calendar-check"></i> Дата до</label>
                        <input type="date" id="filterDateTo" value="${this.filters.dateTo}">
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-chart-line"></i> Сложность</label>
                        <select id="filterDifficulty">
                            <option value="all" ${this.filters.difficulty === 'all' ? 'selected' : ''}>Все сложности</option>
                            <option value="easy" ${this.filters.difficulty === 'easy' ? 'selected' : ''}>Junior / Лёгкий</option>
                            <option value="medium" ${this.filters.difficulty === 'medium' ? 'selected' : ''}>Средний</option>
                            <option value="hard" ${this.filters.difficulty === 'hard' ? 'selected' : ''}>Сложный / Pro</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label><i class="fas fa-search"></i> Поиск</label>
                        <input type="text" id="searchTitle" placeholder="Название..." value="${this.escapeHtml(this.filters.searchText)}">
                    </div>
                    <button class="apply-btn" id="applyFiltersBtn"><i class="fas fa-sliders-h"></i> Применить</button>
                </div>
                
                <div class="calendar-wrapper">
                    <i class="fas fa-calendar-week"></i> <strong>Календарь событий:</strong> 
                    <span id="calendarPreview">Выберите даты для фильтрации</span>
                </div>
                
                <div id="hackathonList" class="hackathon-grid"></div>
            </div>
            
            <div id="calendarView" style="${this.currentView === 'calendar' ? 'display:block' : 'display:none'}"></div>
            
            <footer>
                ⚡ Заглушка данных. Реальные хакатоны будут из папки /hackathons/data.js<br>
                Согласно отчету: фильтрация по датам и сложности (раздел 3.1, 3.3)
            </footer>
        `;
        
        this.container = container;
        this.attachEvents();
        this.updateHackathonList();
        
        if (this.currentView === 'calendar') {
            this.showCalendarView();
        }
        
        return container;
    }
    
    attachEvents() {
        // Кнопка выхода
        this.container.querySelector('#logoutBtn').addEventListener('click', () => {
            logoutUser();
            window.location.reload();
        });
        
        // Открытие профиля
        const userNameBtn = this.container.querySelector('#userNameBtn');
        if (userNameBtn) {
            userNameBtn.style.cursor = 'pointer';
            userNameBtn.addEventListener('click', () => {
                import('../components/ProfileModal.js').then(module => {
                    const ProfileModal = module.ProfileModal;
                    const modal = new ProfileModal(this.currentUser.id, () => {
                        this.currentUser = getCurrentUser();
                        this.updateUserInfo();
                        this.updateHackathonList();
                    });
                    document.body.appendChild(modal.render());
                }).catch(error => {
                    console.error('Ошибка загрузки ProfileModal:', error);
                });
            });
        }
        
        // Переключение между списком и календарем
        const viewBtns = this.container.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.currentView = view;
                
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const listView = this.container.querySelector('#listView');
                const calendarView = this.container.querySelector('#calendarView');
                
                if (view === 'list') {
                    listView.style.display = 'block';
                    calendarView.style.display = 'none';
                    this.updateHackathonList();
                } else {
                    listView.style.display = 'none';
                    calendarView.style.display = 'block';
                    this.showCalendarView();
                }
            });
        });
        
        // Кнопка фильтрации (только для списка)
        const applyBtn = this.container.querySelector('#applyFiltersBtn');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.filters = {
                    dateFrom: this.container.querySelector('#filterDateFrom').value,
                    dateTo: this.container.querySelector('#filterDateTo').value,
                    difficulty: this.container.querySelector('#filterDifficulty').value,
                    searchText: this.container.querySelector('#searchTitle').value,
                    format: 'all'
                };
                this.updateHackathonList();
                this.updateCalendarPreview();
            });
        }
        
        // Авто-обновление фильтров
        const filterFields = ['#filterDateFrom', '#filterDateTo', '#filterDifficulty', '#searchTitle'];
        filterFields.forEach(selector => {
            const el = this.container.querySelector(selector);
            if (el) {
                el.addEventListener('change', () => {
                    this.filters = {
                        dateFrom: this.container.querySelector('#filterDateFrom').value,
                        dateTo: this.container.querySelector('#filterDateTo').value,
                        difficulty: this.container.querySelector('#filterDifficulty').value,
                        searchText: this.container.querySelector('#searchTitle').value,
                        format: 'all'
                    };
                    this.updateHackathonList();
                    this.updateCalendarPreview();
                });
                
                if (selector === '#searchTitle') {
                    let timeout;
                    el.addEventListener('input', () => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            this.filters.searchText = el.value;
                            this.updateHackathonList();
                            this.updateCalendarPreview();
                        }, 300);
                    });
                }
            }
        });
    }
    
    showCalendarView() {
        const calendarContainer = this.container.querySelector('#calendarView');
        if (calendarContainer) {
            calendarContainer.innerHTML = '';
            const calendar = new CalendarView(this.currentUser);
            calendarContainer.appendChild(calendar.render());
        }
    }
    
    updateHackathonList() {
        const filtered = filterHackathons(mockHackathons, this.filters);
        const listContainer = this.container.querySelector('#hackathonList');
        
        if (!listContainer) return;
        
        if (filtered.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">😕 Нет хакатонов по выбранным критериям</div>';
            return;
        }
        
        listContainer.innerHTML = '';
        filtered.forEach(hack => {
            const card = new HackathonCard(hack, this.currentUser);
            listContainer.appendChild(card.render());
        });
    }
    
    updateCalendarPreview() {
        const previewSpan = this.container.querySelector('#calendarPreview');
        if (previewSpan) {
            if (this.filters.dateFrom || this.filters.dateTo) {
                previewSpan.innerHTML = `📆 Фильтр: ${this.filters.dateFrom || 'все'} → ${this.filters.dateTo || 'все'}`;
            } else {
                previewSpan.innerHTML = `🗓️ Сегодня ${new Date().toLocaleDateString()}. Используйте фильтры для поиска хакатонов по датам`;
            }
        }
    }
    
    updateUserInfo() {
        const userNameSpan = this.container.querySelector('#userNameBtn');
        if (userNameSpan) {
            userNameSpan.innerHTML = `<i class="fas fa-user-circle"></i> 👋 ${this.escapeHtml(this.currentUser?.name || 'Пользователь')}`;
        }
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