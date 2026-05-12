import json
import logging
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# Константы
MOCK_FILE = 'mock_hackathons.json'
API_URL = "https://feeds.tildaapi.com/api/getfeed/?feeduid=617755803461&recid=488755787&c=1778524652766&size=8&slice=1&sort%5Bdate%5D=desc&filters%5Bdate%5D%5B%3E%5D=now&getparts=true"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
}

# Словарь для конвертации месяцев на русском
MONTHS_RU = {
    'января': '01', 'январь': '01',
    'февраля': '02', 'февраль': '02',
    'марта': '03', 'март': '03',
    'апреля': '04', 'апрель': '04',
    'мая': '05', 'май': '05',
    'июня': '06', 'июнь': '06',
    'июля': '07', 'июль': '07',
    'августа': '08', 'август': '08',
    'сентября': '09', 'сентябрь': '09',
    'октября': '10', 'октябрь': '10',
    'ноября': '11', 'ноябрь': '11',
    'декабря': '12', 'декабрь': '12'
}

def fetch_feed_data(url: str, headers: dict) -> dict | None:
    """
    Получает данные фида с Tilda API.
    """
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logging.error(f"Ошибка запроса к API ({url}): {e}")
        return None
    except json.JSONDecodeError as e:
        logging.error(f"Ошибка парсинга ответа API: {e}")
        return None

def get_hack_links(feed_data: dict) -> list[str]:
    """
    Формирует список ссылок на страницы хакатонов из ответа API.
    """
    if not feed_data or 'posts' not in feed_data:
        logging.warning("Некорректные данные или отсутствуют посты в ответе API.")
        return []

    return [f"https://www.xn--80aa3anexr8c.xn--p1acf/tpost/{post['uid']}" for post in feed_data['posts']]

def fetch_and_parse_pages(urls: list[str], headers: dict) -> list[BeautifulSoup]:
    """
    Скачивает и парсит HTML страницы хакатонов.
    """
    soups = []
    for url in urls:
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')
            soups.append(soup)
            logging.info(f"Парсинг {url.split('/')[-1]} успешен")
        except requests.RequestException as e:
            logging.error(f"Ошибка доступа к {url}: {e}")
    return soups

def normalize_date(date_str: str) -> str:
    """
    Пытается нормализовать строковую дату в формат YYYY-MM-DD.
    Возвращает строку как есть, если не удалось распарсить.
    Пример: '10 мая' -> '2026-05-10' (предполагая текущий год или год из контекста)
    """
    if not date_str or date_str == "Не указаны" or date_str == "Не указана":
        return ""
        
    date_str_lower = date_str.lower()
    
    # Ищем день и месяц (например: "10 мая" или "13 мая — 30 июня")
    # Для простоты, берем только первую найденную дату
    match = re.search(r'(\d{1,2})\s*([а-я]+)', date_str_lower)
    if match:
        day = match.group(1).zfill(2)
        month_word = match.group(2)
        month = MONTHS_RU.get(month_word, '01')
        
        # Хардкодим год, можно брать из datetime.now().year
        year = str(datetime.now().year)
        
        return f"{year}-{month}-{day}"
        
    return date_str

def normalize_format(format_str: str) -> str:
    """
    Нормализует формат проведения.
    Возвращает 'online', 'offline', 'hybrid' или исходную строку.
    """
    format_str_lower = format_str.lower()
    
    is_online = "онлайн" in format_str_lower or "online" in format_str_lower
    is_offline = "офлайн" in format_str_lower or "offline" in format_str_lower or "очно" in format_str_lower
    
    if is_online and is_offline:
        return "hybrid"
    elif is_online:
        return "online"
    elif is_offline:
        return "offline"
        
    return "hybrid" # Значение по умолчанию, если ничего не подошло

def extract_hackathon_data(soups: list[BeautifulSoup]) -> list[dict]:
    """
    Извлекает информацию о хакатонах из спарсенных страниц с учетом нормализации.
    """
    parsed_hackathons = []
    
    # Для генерации уникальных ID
    current_id = 1

    for soup in soups:
        container = soup.find('div', class_='t-redactor__tte-view')
        if not container:
            logging.warning("Не найден контейнер с данными на странице")
            continue

        raw_blocks = container.find_all('div', class_='t-redactor__text')
        if not raw_blocks:
            continue
            
        raw_dates = "Не указаны"
        raw_format = "Не указан"
        raw_deadline = "Не указана"

        hack_data = {
            "id": current_id,
            "title": raw_blocks[0].get_text(strip=True),
            "startDate": "",
            "endDate": "",
            "difficulty": "medium", # Заглушка, так как парсер не знает сложность
            "description": "",
            "tech": [], # Заглушка, позже можно извлекать теги из текста
            "format": "hybrid",
            "prizePool": "Не указан",
            "organizer": "Неизвестно" # Заглушка
        }

        # Парсинг блоков
        for block in raw_blocks[1:]:
            block_soup = BeautifulSoup(str(block), 'html.parser')

            # Обработка списков
            for li in block_soup.find_all('li'):
                li.insert_before('• ')

            text = block_soup.get_text(separator=" ", strip=True)
            text_lower = text.lower()

            if "хочешь узнавать" in text_lower or "telegram-бот" in text_lower:
                continue

            # Извлечение полей
            if "призовой фонд" in text_lower:
                val = re.split(r'(?i)призовой фонд(?:[\s:—-]+)', text)[-1]
                hack_data["prizePool"] = val.strip()

            elif ("дат" in text_lower and "проведения" in text_lower) or "когда" in text_lower:
                val = re.split(r'(?i)(?:даты проведения|дата проведения|когда\?)(?:[\s:—-]+)', text)[-1]
                raw_dates = val.strip()

            elif "формат" in text_lower:
                val = re.split(r'(?i)формат(?:[\s:—-]+)', text)[-1]
                raw_format = val.strip()

            elif "регистрация до" in text_lower:
                match = re.search(r'(?i)регистрация до\s*(.*?)(?::|$)', text)
                if match:
                    raw_deadline = match.group(1).strip()
            
            # Попытка найти организатора по контексту
            elif "от компании" in text_lower or "от команды" in text_lower:
                match = re.search(r'(?i)от (?:компании|команды)\s+([А-Яа-яA-Za-z0-9\s]+)', text)
                if match:
                    hack_data["organizer"] = match.group(1).strip()
                    
            else:
                desc_chunk = block_soup.get_text(separator="\n", strip=True)
                hack_data["description"] += desc_chunk + "\n\n"

        # Исправление бага с \n• в description, заменяя многократные переносы в списках
        hack_data["description"] = hack_data["description"].strip()
        hack_data["description"] = re.sub(r'\n+•\s*', '\n• ', hack_data["description"])
        
        # Нормализация
        hack_data["format"] = normalize_format(raw_format)
        
        # Из сырых дат "13 мая — 30 июня" пытаемся вытащить start и end
        dates_split = re.split(r'[—\-]', raw_dates)
        if len(dates_split) == 2:
            hack_data["startDate"] = normalize_date(dates_split[0].strip())
            hack_data["endDate"] = normalize_date(dates_split[1].strip())
        else:
            hack_data["startDate"] = normalize_date(raw_dates)
            hack_data["endDate"] = hack_data["startDate"] # Если только одна дата
            
        # Если start/end пустые, берем дедлайн
        if not hack_data["startDate"]:
            hack_data["startDate"] = normalize_date(raw_deadline)
            
        if not hack_data["endDate"]:
            hack_data["endDate"] = hack_data["startDate"]
            
        # Пытаемся вытащить технологии из описания (простейший способ)
        common_tech = ["python", "java", "c++", "c#", "javascript", "react", "ml", "ai", "big data", "ios", "android", "go", "rust", "php", "sql", "linux"]
        found_tech = []
        print('description')
        print(hack_data["description"].lower())
        for tech in common_tech:
            print(tech)
            if tech in hack_data["description"].lower():
                found_tech.append(tech.title() if len(tech) > 2 else tech.upper())
        print("found tech")
        print(found_tech)
        hack_data["tech"] = found_tech

        parsed_hackathons.append(hack_data)
        current_id += 1

    return parsed_hackathons

def save_to_json(data: list[dict] | dict, filename: str):
    """
    Сохраняет данные в JSON файл.
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        logging.info(f"Файл {filename} успешно сгенерирован!")
    except IOError as e:
        logging.error(f"Ошибка записи в {filename}: {e}")

def main():
    logging.info("Начало работы скрипта...")

    # 1. Получение данных фида API
    feed_data = fetch_feed_data(API_URL, HEADERS)
    if not feed_data:
        logging.error("Не удалось получить данные из API. Завершение работы.")
        return
        
    logging.info(f"Успех! Получено данных из API: {len(feed_data.get('posts', []))} постов")

    # 2. Формирование ссылок из данных API
    hack_links = get_hack_links(feed_data)
    if not hack_links:
        logging.warning("Нет ссылок для парсинга, завершение работы.")
        return

    # 3. Парсинг страниц
    soups = fetch_and_parse_pages(hack_links, HEADERS)

    # 4. Извлечение информации
    parsed_data = extract_hackathon_data(soups)

    # 5. Сохранение результата
    if parsed_data:
        save_to_json(parsed_data, MOCK_FILE)
        logging.info("Парсинг успешно завершен.")
    else:
        logging.warning("Не удалось извлечь данные.")

if __name__ == "__main__":
    main()