import { mockHackathons } from '../../data/mockHackathons.js';

export class CalendarView {
    constructor(currentUser) {
        this.currentUser = currentUser;
        this.currentDate = new Date();
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'calendar-view';
        container.id = 'calendarContainer';
        container.innerHTML = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" id="prevMonthBtn"><i class="fas fa-chevron-left"></i></button>
                <h2 id="currentMonthYear">${this.getMonthName(this.currentMonth)} ${this.currentYear}</h2>
                <div>
                    <button class="export-calendar-btn" id="exportCalendarBtn">
                        <i class="fas fa-camera"></i> Экспорт как фото
                    </button>
                    <button class="calendar-nav-btn" id="nextMonthBtn"><i class="fas fa-chevron-right"></i></button>
                </div>
            </div>
            <div class="calendar-weekdays">
                <div class="weekday">Пн</div>
                <div class="weekday">Вт</div>
                <div class="weekday">Ср</div>
                <div class="weekday">Чт</div>
                <div class="weekday">Пт</div>
                <div class="weekday">Сб</div>
                <div class="weekday">Вс</div>
            </div>
            <div class="calendar-days" id="calendarDays"></div>
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color hack-day"></div>
                    <span>Дни с хакатонами</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color today"></div>
                    <span>Сегодня</span>
                </div>
            </div>
        `;
        
        this.container = container;
        this.attachEvents();
        this.renderCalendar();
        
        return container;
    }
    
    renderCalendar() {
        const daysContainer = this.container.querySelector('#calendarDays');
        daysContainer.innerHTML = '';
        
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
        let startDayOfWeek = firstDayOfMonth.getDay();
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
        
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
        const hackathonsInMonth = this.getHackathonsForMonth();
        
        const hackathonsByDay = {};
        hackathonsInMonth.forEach(hack => {
            const day = parseInt(hack.startDate.split('-')[2]);
            if (!hackathonsByDay[day]) {
                hackathonsByDay[day] = [];
            }
            hackathonsByDay[day].push(hack);
        });
        
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            daysContainer.appendChild(emptyDay);
        }
        
        const today = new Date();
        const isCurrentMonth = today.getFullYear() === this.currentYear && today.getMonth() === this.currentMonth;
        const currentDay = today.getDate();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            const hasHackathons = hackathonsByDay[day] && hackathonsByDay[day].length > 0;
            const isToday = isCurrentMonth && day === currentDay;
            
            if (hasHackathons) {
                dayElement.classList.add('has-hackathons');
            }
            if (isToday) {
                dayElement.classList.add('today');
            }
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            dayElement.appendChild(dayNumber);
            
            if (hasHackathons) {
                const hackList = document.createElement('div');
                hackList.className = 'hack-list';
                hackList.innerHTML = hackathonsByDay[day].slice(0, 2).map(hack => `
                    <div class="hack-preview" title="${this.escapeHtml(hack.title)}">
                        ${this.escapeHtml(hack.title.length > 20 ? hack.title.substring(0, 20) + '...' : hack.title)}
                    </div>
                `).join('');
                
                if (hackathonsByDay[day].length > 2) {
                    const more = document.createElement('div');
                    more.className = 'hack-preview more';
                    more.textContent = `+${hackathonsByDay[day].length - 2} еще`;
                    hackList.appendChild(more);
                }
                
                dayElement.appendChild(hackList);
            }
            
            if (hasHackathons) {
                dayElement.addEventListener('click', () => {
                    this.showDayHackathons(day, hackathonsByDay[day]);
                });
                dayElement.style.cursor = 'pointer';
            }
            
            daysContainer.appendChild(dayElement);
        }
    }
    
    getHackathonsForMonth() {
        const startDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-01`;
        const endDate = `${this.currentYear}-${String(this.currentMonth + 1).padStart(2, '0')}-${new Date(this.currentYear, this.currentMonth + 1, 0).getDate()}`;
        
        return mockHackathons.filter(hack => {
            return hack.startDate >= startDate && hack.startDate <= endDate;
        });
    }
    
    showDayHackathons(day, hackathons) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container small">
                <div class="modal-header">
                    <h2><i class="fas fa-calendar-day"></i> Хакатоны ${day} ${this.getMonthName(this.currentMonth)} ${this.currentYear}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">
                    <div class="day-hackathons-list">
                        ${hackathons.map(hack => `
                            <div class="day-hack-card">
                                <h4>${this.escapeHtml(hack.title)}</h4>
                                <div class="hack-details">
                                    <span class="difficulty ${hack.difficulty}">${hack.difficulty === 'easy' ? 'Легкий' : hack.difficulty === 'medium' ? 'Средний' : 'Сложный'}</span>
                                    <span><i class="fas fa-map-marker-alt"></i> ${hack.format}</span>
                                    <span><i class="fas fa-trophy"></i> ${hack.prizePool}</span>
                                </div>
                                <p>${this.escapeHtml(hack.description)}</p>
                                <div class="tech-tags">
                                    ${hack.tech.map(t => `<span class="tech-tag">${this.escapeHtml(t)}</span>`).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
    
    async exportCalendarAsImage() {
        const calendarElement = this.container.cloneNode(true);
        calendarElement.style.position = 'absolute';
        calendarElement.style.top = '-9999px';
        calendarElement.style.left = '-9999px';
        calendarElement.style.width = '800px';
        calendarElement.style.background = 'white';
        calendarElement.style.padding = '20px';
        calendarElement.style.borderRadius = '24px';
        document.body.appendChild(calendarElement);
        
        // Применяем стили для экспорта
        const style = document.createElement('style');
        style.textContent = `
            .calendar-view {
                background: white !important;
            }
            .calendar-header h2 {
                color: #1e293b !important;
                background: none !important;
                -webkit-background-clip: unset !important;
                background-clip: unset !important;
            }
            .weekday {
                background: #f1f5f9 !important;
                color: #475569 !important;
            }
            .calendar-day {
                background: #f8fafc !important;
                border-color: #e2e8f0 !important;
            }
            .day-number {
                color: #1e293b !important;
            }
            .hack-preview {
                background: white !important;
                color: #1e293b !important;
            }
            .legend-item span {
                color: #1e293b !important;
            }
        `;
        calendarElement.appendChild(style);
        
        try {
            const canvas = await html2canvas(calendarElement, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });
            
            const link = document.createElement('a');
            const monthName = this.getMonthName(this.currentMonth);
            link.download = `calendar_${monthName}_${this.currentYear}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            this.showNotification('Календарь успешно сохранен!', true);
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            this.showNotification('Ошибка при сохранении календаря', false);
        } finally {
            document.body.removeChild(calendarElement);
        }
    }
    
    showNotification(message, isSuccess) {
        const notification = document.createElement('div');
        notification.className = `notification ${isSuccess ? 'notification-success' : 'notification-error'}`;
        notification.innerHTML = `
            <i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    attachEvents() {
        const prevBtn = this.container.querySelector('#prevMonthBtn');
        const nextBtn = this.container.querySelector('#nextMonthBtn');
        const exportBtn = this.container.querySelector('#exportCalendarBtn');
        
        prevBtn.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            this.updateCalendar();
        });
        
        nextBtn.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            this.updateCalendar();
        });
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                // Проверяем наличие html2canvas
                if (typeof html2canvas === 'undefined') {
                    this.loadHtml2Canvas().then(() => {
                        this.exportCalendarAsImage();
                    });
                } else {
                    this.exportCalendarAsImage();
                }
            });
        }
    }
    
    loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    updateCalendar() {
        const monthYearSpan = this.container.querySelector('#currentMonthYear');
        monthYearSpan.textContent = `${this.getMonthName(this.currentMonth)} ${this.currentYear}`;
        this.renderCalendar();
    }
    
    getMonthName(month) {
        const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return months[month];
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