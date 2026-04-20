import { initStorage, getCurrentUser } from './services/storageService.js';
import { AuthComponent } from './components/auth.js';
import { MainApp } from './components/mainApp.js';
import { getUserSettings, applyTheme, applyFontSize } from './services/themeService.js';

function init() {
    initStorage();
    
    const appContainer = document.getElementById('app');
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        const settings = getUserSettings(currentUser.id);
        applyTheme(settings.theme);
        applyFontSize(settings.fontSize);
        
        const mainApp = new MainApp();
        appContainer.innerHTML = '';
        appContainer.appendChild(mainApp.render());
    } else {
        const authComponent = new AuthComponent(() => {
            init();
        });
        appContainer.innerHTML = '';
        appContainer.appendChild(authComponent.render());
    }
}

init();