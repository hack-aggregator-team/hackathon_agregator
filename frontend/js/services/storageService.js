const USERS_KEY = 'hackathon_users';
const CURRENT_USER_KEY = 'hackathon_current_user';

export function initStorage() {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
            {
                id: '1',
                name: 'Алексей',
                email: 'test@test.ru',
                password: '123456',
                city: 'Москва',
                skills: ['JavaScript', 'React'],
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}

export function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

export function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function findUserByEmail(email) {
    const users = getUsers();
    return users.find(u => u.email === email);
}

export function createUser(userData) {
    const users = getUsers();
    
    if (findUserByEmail(userData.email)) {
        return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    
    const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        city: userData.city || '',
        skills: userData.skills || [],
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, user: newUser };
}

export function loginUser(email, password) {
    const user = findUserByEmail(email);
    
    if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
        return { success: true, user: userWithoutPassword };
    }
    
    return { success: false, message: 'Неверный email или пароль' };
}

export function getCurrentUser() {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
}

export function logoutUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

export function updateUserProfile(userId, updates) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        
        const current = getCurrentUser();
        if (current && current.id === userId) {
            const { password: _, ...updatedUser } = users[index];
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
        }
        
        return { success: true, user: users[index] };
    }
    
    return { success: false, message: 'Пользователь не найден' };
}