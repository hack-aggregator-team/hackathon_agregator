"""
Сервис агрегации данных.
Содержит логику для парсинга ИТ-мероприятий с внешних площадок (Timepad, Codenrock).
"""

from typing import List, Dict
from models import HackathonEvent


class ParserSystem:
    """
    Главный класс для управления сбором данных с внешних API.
    """

    def __init__(self, source_urls: List[str]):
        """
        Инициализирует систему парсинга.

        Args:
            source_urls (List[str]): Список URL-адресов API доноров для парсинга.
        """
        self.source_urls = source_urls

    def fetch_timepad_events(self, category_id: int) -> List[Dict]:
        """
        Запрашивает сырые данные о мероприятиях из API Timepad.

        Args:
            category_id (int): Идентификатор категории (например, IT и Интернет).

        Returns:
            List[Dict]: Массив сырых словарей (JSON) с данными от площадки.
        """
        pass

    def normalize_and_save(self, raw_events: List[Dict]) -> int:
        """
        Очищает сырые данные, проверяет на дубликаты и сохраняет в базу данных.

        Args:
            raw_events (List[Dict]): Данные, полученные от функции fetch_timepad_events.

        Returns:
            int: Количество успешно сохраненных новых хакатонов.
        """
        pass