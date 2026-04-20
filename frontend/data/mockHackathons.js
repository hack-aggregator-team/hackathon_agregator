// Заглушка данных хакатонов (позже будет импорт из файлов)
export const mockHackathons = [
    {
        id: 1,
        title: "Digital Breakthrough 2026",
        startDate: "2026-05-10",
        endDate: "2026-05-12",
        difficulty: "medium",
        description: "AI & Big Data трек. Лучшие инновации в области искусственного интеллекта",
        tech: ["Python", "Machine Learning", "TensorFlow"],
        format: "online",
        prizePool: "1 000 000 ₽",
        organizer: "Сбер"
    },
    {
        id: 2,
        title: "SmartContract Hack",
        startDate: "2026-05-18",
        endDate: "2026-05-20",
        difficulty: "hard",
        description: "Разработка смарт-контрактов и DeFi решений",
        tech: ["Solidity", "Web3", "Rust"],
        format: "offline",
        prizePool: "2 500 000 ₽",
        organizer: "Binance"
    },
    {
        id: 3,
        title: "Youth Coder Fest",
        startDate: "2026-04-28",
        endDate: "2026-04-30",
        difficulty: "easy",
        description: "Для начинающих разработчиков. Менторство и обучение",
        tech: ["JavaScript", "HTML/CSS", "React"],
        format: "online",
        prizePool: "300 000 ₽",
        organizer: "Яндекс"
    },
    {
        id: 4,
        title: "FinTech Revolution",
        startDate: "2026-06-01",
        endDate: "2026-06-03",
        difficulty: "hard",
        description: "Банковские инновации и финтех решения",
        tech: ["Java", "Spring", "Kafka"],
        format: "offline",
        prizePool: "3 000 000 ₽",
        organizer: "Тинькофф"
    },
    {
        id: 5,
        title: "EcoTech Solution",
        startDate: "2026-05-25",
        endDate: "2026-05-27",
        difficulty: "medium",
        description: "Устойчивое развитие и green technologies",
        tech: ["IoT", "Analytics", "Python"],
        format: "hybrid",
        prizePool: "1 500 000 ₽",
        organizer: "Росатом"
    },
    {
        id: 6,
        title: "UI/UX Battle",
        startDate: "2026-05-05",
        endDate: "2026-05-07",
        difficulty: "easy",
        description: "Дизайн интерфейсов и пользовательский опыт",
        tech: ["Figma", "Prototyping", "User Testing"],
        format: "online",
        prizePool: "500 000 ₽",
        organizer: "VK"
    }
];

// Функция фильтрации
export function filterHackathons(hackathons, filters) {
    return hackathons.filter(h => {
        if (filters.dateFrom && h.startDate < filters.dateFrom) return false;
        if (filters.dateTo && h.startDate > filters.dateTo) return false;
        if (filters.difficulty !== 'all' && h.difficulty !== filters.difficulty) return false;
        if (filters.searchText && !h.title.toLowerCase().includes(filters.searchText.toLowerCase())) return false;
        if (filters.format && filters.format !== 'all' && h.format !== filters.format) return false;
        return true;
    });
}