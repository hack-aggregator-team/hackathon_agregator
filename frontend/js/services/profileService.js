import { getUsers, saveUsers, getCurrentUser } from './storageService.js';

export function getUserRegisteredHackathons(userId) {
    const key = `user_hackathons_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

export function registerForHackathon(userId, hackathonId, hackathonData) {
    const registered = getUserRegisteredHackathons(userId);
    
    if (registered.find(h => h.id === hackathonId)) {
        return { success: false, message: '❌ Вы уже зарегистрированы на этот хакатон' };
    }
    
    const registration = {
        id: hackathonId,
        title: hackathonData.title,
        startDate: hackathonData.startDate,
        endDate: hackathonData.endDate,
        tech: hackathonData.tech,
        difficulty: hackathonData.difficulty,
        format: hackathonData.format,
        prizePool: hackathonData.prizePool,
        registeredAt: new Date().toISOString(),
        status: 'pending'
    };
    
    registered.push(registration);
    localStorage.setItem(`user_hackathons_${userId}`, JSON.stringify(registered));
    
    return { success: true, message: '✅ Вы успешно записались на хакатон!' };
}

export function cancelRegistration(userId, hackathonId) {
    const registered = getUserRegisteredHackathons(userId);
    const filtered = registered.filter(h => h.id !== hackathonId);
    localStorage.setItem(`user_hackathons_${userId}`, JSON.stringify(filtered));
    return { success: true, message: 'Регистрация отменена' };
}

export function updateUserProfileData(userId, profileData) {
    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index !== -1) {
        users[index] = { ...users[index], ...profileData };
        saveUsers(users);
        
        const current = getCurrentUser();
        if (current && current.id === userId) {
            const { password: _, ...updatedUser } = users[index];
            localStorage.setItem('hackathon_current_user', JSON.stringify(updatedUser));
        }
        
        return { success: true, user: users[index] };
    }
    
    return { success: false, message: 'Пользователь не найден' };
}