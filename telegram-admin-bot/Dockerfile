# Используем официальный образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Node.js для возможной компиляции фронтенда
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest

# Копируем requirements.txt
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь код приложения
COPY . .

# Создаем необходимые директории
RUN mkdir -p static templates

# Устанавливаем правильные разрешения
RUN chmod -R 755 static templates

# Открываем порты
EXPOSE 5000

# Создаем не-root пользователя для безопасности
RUN useradd -m -u 1000 appuser
USER appuser

# Команда запуска с использованием gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--threads", "2", "--timeout", "120", "app:app"]