"""
Модуль моделей данных для работы с базой данных PostgreSQL.
Содержит ORM-схемы (Object-Relational Mapping) для пользователей и хакатонов.
"""

from typing import List, Optional
from datetime import datetime


class User:
    """
    Модель пользователя системы (Участника хакатонов).

    Attributes:
        id (int): Уникальный идентификатор пользователя.
        email (str): Электронная почта для авторизации.
        password_hash (str): Захешированный пароль.
        city (str): Город проживания пользователя.
        skills (List[str]): Список профессиональных навыков (например, ['Python', 'React']).
        created_at (datetime): Дата и время регистрации в системе.
    """

    def __init__(self, email: str, password_hash: str, city: str):
        """
        Инициализация нового пользователя.
        """
        pass

    def add_skill(self, skill: str) -> bool:
        """
        Добавляет новый навык в профиль пользователя.

        Args:
            skill (str): Название навыка.

        Returns:
            bool: True, если навык успешно добавлен, иначе False.
        """
        pass


class HackathonEvent:
    """
    Модель ИТ-мероприятия (Хакатона).

    Attributes:
        id (int): Внутренний идентификатор мероприятия.
        external_id (str): Идентификатор мероприятия на сайте-источнике (например, Timepad).
        title (str): Название хакатона.
        starts_at (datetime): Дата и время начала мероприятия.
        difficulty (str): Уровень сложности (Легкий, Средний, Сложный).
        tags (List[str]): Теги мероприятия (например, 'AI', 'Fintech').
    """
    pass