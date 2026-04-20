const SETTINGS_KEY = 'user_settings';

export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

export const FONT_SIZES = {
    SMALL: 'small',
    MEDIUM: 'medium',
    LARGE: 'large'
};

const defaultSettings = {
    theme: THEMES.LIGHT,
    fontSize: FONT_SIZES.MEDIUM,
    notifications: true,
    compactView: false
};

export function getUserSettings(userId) {
    const settings = localStorage.getItem(`${SETTINGS_KEY}_${userId}`);
    if (!settings) {
        return { ...defaultSettings };
    }
    return JSON.parse(settings);
}

export function saveUserSettings(userId, settings) {
    localStorage.setItem(`${SETTINGS_KEY}_${userId}`, JSON.stringify(settings));
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);
    return settings;
}

export function applyTheme(theme) {
    if (theme === THEMES.DARK) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

export function applyFontSize(fontSize) {
    const root = document.documentElement;
    if (fontSize === FONT_SIZES.SMALL) {
        root.style.fontSize = '14px';
    } else if (fontSize === FONT_SIZES.LARGE) {
        root.style.fontSize = '18px';
    } else {
        root.style.fontSize = '16px';
    }
}

export function updateSetting(userId, key, value) {
    const settings = getUserSettings(userId);
    settings[key] = value;
    saveUserSettings(userId, settings);
    return settings;
}