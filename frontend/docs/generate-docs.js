const fs = require('fs');

const docs = JSON.parse(fs.readFileSync('.docsrc.json', 'utf8'));

let html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Документация - ${docs.project.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; background: #f5f7fa; padding: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1 { color: #1e293b; margin-bottom: 0.5rem; }
        .badge { display: inline-block; background: #3b82f6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; }
        .card { background: white; border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        h2 { color: #1e293b; margin-bottom: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        h3 { color: #475569; margin: 1rem 0 0.5rem 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        th { background: #f8fafc; font-weight: 600; color: #1e293b; }
        code { background: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; }
        .version { color: #64748b; margin-bottom: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 ${docs.project.name}</h1>
        <div class="version">
            <span class="badge">v${docs.project.version}</span>
            <span style="margin-left: 0.5rem;">${docs.project.created}</span>
        </div>
        <p>${docs.project.description}</p>
        <p><strong>Авторы:</strong> ${docs.project.author}</p>
        
        <div class="card">
            <h2>🛠 Технологический стек</h2>
            <table>
                <tr><th>Компонент</th><th>Версия/Технология</th></tr>
                <tr><td>Язык</td><td>${docs.techStack.language}</td></tr>
                <tr><td>Стили</td><td>${docs.techStack.styles}</td></tr>
                <tr><td>Иконки</td><td>${docs.techStack.icons}</td></tr>
                <tr><td>Хранилище</td><td>${docs.techStack.storage}</td></tr>
                <tr><td>Календарь</td><td>${docs.techStack.calendar}</td></tr>
            </table>
        </div>
        
        <div class="card">
            <h2>📦 Классы</h2>
            ${Object.entries(docs.classes).map(([name, cls]) => `
                <h3>${name}</h3>
                <p><code>${cls.file}</code></p>
                <p>${cls.description}</p>
                <p><strong>Методы:</strong> ${cls.methods.join(', ')}</p>
                <p><strong>Свойства:</strong> ${cls.properties ? cls.properties.join(', ') : '-'}</p>
                <hr style="margin: 1rem 0;">
            `).join('')}
        </div>
        
        <div class="card">
            <h2>🔧 Сервисы</h2>
            ${Object.entries(docs.services).map(([name, service]) => `
                <h3>${name}</h3>
                <p><code>${service.file}</code></p>
                <p>${service.description}</p>
                <p><strong>Функции:</strong> ${service.functions.join(', ')}</p>
                <hr style="margin: 1rem 0;">
            `).join('')}
        </div>
        
        <div class="card">
            <h2>💾 Данные</h2>
            <p><strong>${docs.data.mockHackathons.file}</strong></p>
            <p>${docs.data.mockHackathons.description}</p>
            <p>Количество хакатонов: ${docs.data.mockHackathons.count}</p>
        </div>
        
        <div class="card">
            <h2>🎨 Стили</h2>
            <p><code>${docs.styles.file}</code></p>
            <p>${docs.styles.description}</p>
            <p><strong>Особенности:</strong> ${docs.styles.features.join(', ')}</p>
        </div>
        
        <div class="card">
            <h2>📋 Скрипты</h2>
            <table>
                <tr><th>Команда</th><th>Описание</th></tr>
                <tr><td><code>npm start</code></td><td>Запуск локального сервера на порту 8000</td></tr>
                <tr><td><code>npm run docs</code></td><td>Генерация документации JSDoc</td></tr>
            </table>
        </div>
        
        <div class="card">
            <h2>📦 Зависимости</h2>
            <table>
                <tr><th>Пакет</th><th>Версия</th><th>Назначение</th></tr>
                <tr><td>html2canvas</td><td>${docs.techStack.calendar.split(' ')[1] || '1.4.1'}</td><td>Экспорт календаря в PNG</td></tr>
                <tr><td>Font Awesome</td><td>6.0.0</td><td>Иконки</td></tr>
                <tr><td>JSDoc</td><td>4.0.0</td><td>Генерация документации</td></tr>
            </table>
        </div>
        
        <div class="card">
            <h2>📁 Структура проекта</h2>
            <pre style="background: #f8fafc; padding: 1rem; border-radius: 8px; overflow-x: auto;">
frontend/
├── index.html
├── css/
│   └── styles.css          # Все стили (Glassmorphism + неон)
├── js/
│   ├── app.js              # Точка входа
│   ├── services/           # Сервисы для работы с данными
│   ├── components/         # UI компоненты
│   ├── models/             # Модели данных
│   └── utils/              # Вспомогательные функции
└── data/
    └── mockHackathons.js   # Заглушка с хакатонами
            </pre>
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync('docs.html', html);
console.log('✅ Документация создана: docs.html');