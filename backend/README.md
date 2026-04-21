# ⚙️ Backend & Data Aggregation

Серверная часть приложения, отвечающая за обработку данных, хранение информации в БД и предоставление REST API для фронтенда.

## 🛠 Стек технологий

- **Python 3.10+**
- **FastAPI** — веб-фреймворк для создания API.
- **PostgreSQL** — реляционная база данных.
- **SQLAlchemy** — ORM для взаимодействия с БД.
- **Pdoc** — генератор технической документации.

## 📦 Установка и запуск

1. Перейдите в директорию `backend`:
   ```bash
   cd backend
   ```

2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Для Windows: venv\Scripts\activate
   ```

3. Установите зависимости:
   ```bash
   pip install fastapi uvicorn pdoc sqlalchemy psycopg2-binary
   ```

4. Запустите сервер:
   ```bash
   uvicorn main:app --reload
   ```