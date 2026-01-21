import os
from dotenv import load_dotenv

load_dotenv()

# Конфигурация Telegram бота
BOT_TOKEN = "8237799374:AAHGLaCB9NSGa9DAu_FLX29U2esLoqYIpdY"
ADMIN_PASSWORD = "ar_got_shalava"
SESSION_COOKIE_NAME = "tg_admin_session"
SESSION_SECRET_KEY = "your-secret-key-change-this"

# Конфигурация базы данных
DATABASE_FILE = "data.db"

# Регулярные выражения для парсинга
import re

PHONE_REGEX = r'\+7\d{10}'
CARD_REGEX = r'\b\d{16}\b'
EMAIL_REGEX = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
AMOUNT_REGEX = r'\d+!|!\d+'
BANK_REGEX = r'[ТT]-?[БB]анк|Сбер|СБЕР|тбанк|т-банк|сбер'
FIO_REGEX = r'^[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+\s[А-ЯЁ][а-яё]+$'
ACCOUNT_REGEX = r'\b\d{20}\b'