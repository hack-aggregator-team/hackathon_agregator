// Модель пользователя согласно логической модели БД (раздел 3.2 отчета)
export class User {
    constructor(id, name, email, password, city = '', skills = [], role = 'user') {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.city = city;
        this.skills = skills;
        this.role = role;
        this.createdAt = new Date().toISOString();
    }
    
    register() {
        return { success: true, message: 'Пользователь зарегистрирован' };
    }
    
    login(email, password) {
        return this.email === email && this.password === password;
    }
    
    restorePassword(email) {
        console.log(`Восстановление пароля для ${email}`);
        return { success: true, message: 'Инструкция отправлена на почту' };
    }
    
    addToSavedEvents(eventId) {
        const saved = JSON.parse(localStorage.getItem(`saved_${this.id}`) || '[]');
        if (!saved.includes(eventId)) {
            saved.push(eventId);
            localStorage.setItem(`saved_${this.id}`, JSON.stringify(saved));
        }
    }
    
    getSavedEvents() {
        return JSON.parse(localStorage.getItem(`saved_${this.id}`) || '[]');
    }
}