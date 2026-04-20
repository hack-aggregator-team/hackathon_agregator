export class HackathonCard {
    constructor(hackathon, currentUser) {
        this.hackathon = hackathon;
        this.currentUser = currentUser;
    }
    
    render() {
        const card = document.createElement('div');
        card.className = 'hack-card';
        
        const difficultyClass = this.hackathon.difficulty;
        const difficultyText = {
            'easy': 'Начинающим',
            'medium': 'Средний',
            'hard': 'Сложный'
        }[this.hackathon.difficulty];
        
        card.innerHTML = `
            <div class="hack-title">${this.escapeHtml(this.hackathon.title)}</div>
            <div class="hack-date">
                <i class="far fa-calendar-alt"></i> 
                ${this.hackathon.startDate} — ${this.hackathon.endDate}
            </div>
            <div class="difficulty ${difficultyClass}">⭐ ${difficultyText}</div>
            <p style="margin: 10px 0; font-size: 0.85rem; color:#334155;">
                ${this.escapeHtml(this.hackathon.description)}
            </p>
            <div class="tech-tags">
                ${this.hackathon.tech.map(t => `<span class="tech-tag">${this.escapeHtml(t)}</span>`).join('')}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; color:#64748b;">
                <i class="fas fa-trophy"></i> ${this.hackathon.prizePool} | 
                <i class="fas ${this.hackathon.format === 'online' ? 'fa-globe' : 'fa-building'}"></i> ${this.hackathon.format}
            </div>
            <div class="card-actions" style="margin-top: 15px;">
                <button class="register-hack-btn" data-id="${this.hackathon.id}">
                    <i class="fas fa-calendar-plus"></i> Записаться на хакатон
                </button>
            </div>
            <hr style="margin: 12px 0;">
            <div style="font-size:0.7rem; color:#4b5563; text-align: center;">
                🚧 Заглушка: позже данные из отдельного файла
            </div>
        `;
        
        this.attachEvents(card);
        return card;
    }
    
    attachEvents(card) {
        const registerBtn = card.querySelector('.register-hack-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (!this.currentUser) {
                    this.showNotification('Пожалуйста, войдите в систему', false);
                    return;
                }
                
                import('../services/profileService.js').then(module => {
                    const result = module.registerForHackathon(
                        this.currentUser.id, 
                        this.hackathon.id, 
                        this.hackathon
                    );
                    
                    this.showNotification(result.message, result.success);
                    
                    if (result.success) {
                        registerBtn.innerHTML = '<i class="fas fa-check"></i> Вы записаны!';
                        registerBtn.disabled = true;
                        registerBtn.style.opacity = '0.6';
                        registerBtn.style.cursor = 'not-allowed';
                    }
                }).catch(error => {
                    console.error('Ошибка при записи:', error);
                    this.showNotification('Произошла ошибка при записи на хакатон', false);
                });
            });
        }
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