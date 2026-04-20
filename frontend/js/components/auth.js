import { loginUser, createUser } from '../services/storageService.js';

export class AuthComponent {
    constructor(onLoginSuccess) {
        this.onLoginSuccess = onLoginSuccess;
        this.currentTab = 'login';
    }
    
    render() {
        const container = document.createElement('div');
        container.className = 'auth-screen';
        container.innerHTML = `
            <div class="auth-card">
                <h2>🔐 Добро пожаловать</h2>
                <div class="tab-buttons">
                    <button class="tab-btn ${this.currentTab === 'login' ? 'active' : ''}" data-tab="login">Вход</button>
                    <button class="tab-btn ${this.currentTab === 'register' ? 'active' : ''}" data-tab="register">Регистрация</button>
                </div>
                
                <div id="loginForm" class="auth-form" style="${this.currentTab === 'login' ? 'display:block' : 'display:none'}">
                    <input type="email" id="loginEmail" placeholder="Email">
                    <input type="password" id="loginPassword" placeholder="Пароль">
                    <button id="doLoginBtn">Войти</button>
                    <div id="loginMessage" class="message"></div>
                </div>
                
                <div id="registerForm" class="auth-form" style="${this.currentTab === 'register' ? 'display:block' : 'display:none'}">
                    <input type="text" id="regName" placeholder="Имя пользователя">
                    <input type="email" id="regEmail" placeholder="Email">
                    <input type="password" id="regPassword" placeholder="Пароль">
                    <input type="text" id="regCity" placeholder="Город (необязательно)">
                    <input type="text" id="regSkills" placeholder="Навыки через запятую (необязательно)">
                    <button id="doRegisterBtn">Создать аккаунт</button>
                    <div id="regMessage" class="message"></div>
                </div>
            </div>
        `;
        
        this.container = container;
        this.attachEvents();
        return container;
    }
    
    attachEvents() {
        const loginBtn = this.container.querySelector('#doLoginBtn');
        const regBtn = this.container.querySelector('#doRegisterBtn');
        const tabBtns = this.container.querySelectorAll('.tab-btn');
        
        tabBtns.forEach(btn => {
            btn.removeEventListener('click', this.handleTabClick);
            this.handleTabClick = (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.currentTab = tab;
                
                const loginForm = this.container.querySelector('#loginForm');
                const registerForm = this.container.querySelector('#registerForm');
                const loginTabBtn = this.container.querySelector('.tab-btn[data-tab="login"]');
                const registerTabBtn = this.container.querySelector('.tab-btn[data-tab="register"]');
                
                if (tab === 'login') {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                    loginTabBtn.classList.add('active');
                    registerTabBtn.classList.remove('active');
                } else {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                    loginTabBtn.classList.remove('active');
                    registerTabBtn.classList.add('active');
                }
            };
            btn.addEventListener('click', this.handleTabClick);
        });
        
        if (loginBtn) {
            loginBtn.removeEventListener('click', this.handleLogin);
            this.handleLogin = () => {
                const email = this.container.querySelector('#loginEmail').value;
                const password = this.container.querySelector('#loginPassword').value;
                const result = loginUser(email, password);
                
                const messageDiv = this.container.querySelector('#loginMessage');
                if (result.success) {
                    messageDiv.textContent = 'Вход выполнен! Перенаправление...';
                    messageDiv.className = 'message success';
                    setTimeout(() => {
                        if (this.onLoginSuccess) this.onLoginSuccess();
                    }, 500);
                } else {
                    messageDiv.textContent = result.message;
                    messageDiv.className = 'message';
                }
            };
            loginBtn.addEventListener('click', this.handleLogin);
        }
        
        if (regBtn) {
            regBtn.removeEventListener('click', this.handleRegister);
            this.handleRegister = () => {
                const name = this.container.querySelector('#regName').value;
                const email = this.container.querySelector('#regEmail').value;
                const password = this.container.querySelector('#regPassword').value;
                const city = this.container.querySelector('#regCity').value;
                const skillsStr = this.container.querySelector('#regSkills').value;
                const skills = skillsStr ? skillsStr.split(',').map(s => s.trim()) : [];
                
                const messageDiv = this.container.querySelector('#regMessage');
                
                if (!name || !email || !password) {
                    messageDiv.textContent = 'Заполните обязательные поля (Имя, Email, Пароль)';
                    messageDiv.className = 'message';
                    return;
                }
                
                if (password.length < 4) {
                    messageDiv.textContent = 'Пароль должен быть не менее 4 символов';
                    messageDiv.className = 'message';
                    return;
                }
                
                const result = createUser({ name, email, password, city, skills });
                
                if (result.success) {
                    messageDiv.textContent = '✅ Регистрация успешна! Теперь войдите.';
                    messageDiv.className = 'message success';
                    
                    this.container.querySelector('#regName').value = '';
                    this.container.querySelector('#regEmail').value = '';
                    this.container.querySelector('#regPassword').value = '';
                    this.container.querySelector('#regCity').value = '';
                    this.container.querySelector('#regSkills').value = '';
                    
                    setTimeout(() => {
                        const loginTabBtn = this.container.querySelector('.tab-btn[data-tab="login"]');
                        const loginForm = this.container.querySelector('#loginForm');
                        const registerForm = this.container.querySelector('#registerForm');
                        const registerTabBtn = this.container.querySelector('.tab-btn[data-tab="register"]');
                        
                        loginForm.style.display = 'block';
                        registerForm.style.display = 'none';
                        loginTabBtn.classList.add('active');
                        registerTabBtn.classList.remove('active');
                        this.currentTab = 'login';
                    }, 1500);
                } else {
                    messageDiv.textContent = '❌ ' + result.message;
                    messageDiv.className = 'message';
                }
            };
            regBtn.addEventListener('click', this.handleRegister);
        }
        
        const addEnterListener = (inputId, buttonId) => {
            const input = this.container.querySelector(inputId);
            const button = this.container.querySelector(buttonId);
            if (input && button) {
                input.removeEventListener('keypress', this.enterHandler);
                this.enterHandler = (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        button.click();
                    }
                };
                input.addEventListener('keypress', this.enterHandler);
            }
        };
        
        addEnterListener('#loginPassword', '#doLoginBtn');
        addEnterListener('#regPassword', '#doRegisterBtn');
    }
    
    destroy() {
        if (this.handleTabClick) {
            this.container.querySelectorAll('.tab-btn').forEach(btn => {
                btn.removeEventListener('click', this.handleTabClick);
            });
        }
        const loginBtn = this.container.querySelector('#doLoginBtn');
        if (loginBtn && this.handleLogin) {
            loginBtn.removeEventListener('click', this.handleLogin);
        }
        const regBtn = this.container.querySelector('#doRegisterBtn');
        if (regBtn && this.handleRegister) {
            regBtn.removeEventListener('click', this.handleRegister);
        }
    }
}