import re
import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
from config import BOT_TOKEN, PHONE_REGEX, CARD_REGEX, EMAIL_REGEX, AMOUNT_REGEX, BANK_REGEX, FIO_REGEX, ACCOUNT_REGEX
from database import add_admin_data, add_user_data

# Настройка логирования
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

class TelegramBot:
    def __init__(self):
        self.application = Application.builder().token(BOT_TOKEN).build()
        self.setup_handlers()
        
    def setup_handlers(self):
        # Обработчик команды /sr
        self.application.add_handler(CommandHandler("sr", self.start_recording))
        
        # Обработчик сообщений
        self.application.add_handler(MessageHandler(
            filters.TEXT & ~filters.COMMAND, 
            self.handle_message
        ))
        
        # Обработчик ошибок
        self.application.add_error_handler(self.error_handler)
    
    async def is_admin(self, update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
        """Проверяет, является ли отправитель администратором"""
        try:
            chat_id = update.effective_chat.id
            user_id = update.effective_user.id
            
            # Получаем информацию об администраторах чата
            chat_member = await context.bot.get_chat_member(chat_id, user_id)
            
            return chat_member.status in ['administrator', 'creator']
        except Exception as e:
            logger.error(f"Error checking admin status: {e}")
            return False
    
    async def start_recording(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик команды /sr"""
        if not await self.is_admin(update, context):
            return
            
        await update.message.reply_text(
            "Запись данных активирована. Участники могут отправлять свои данные.\n"
            "Формат данных:\n"
            "1. ФИО (Иванов Иван Иванович)\n"
            "2. Номер карты (2200**********)\n"
            "3. Номер счета\n"
            "4. Номер телефона (+7**********)"
        )
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик всех текстовых сообщений"""
        message_text = update.message.text
        chat_id = update.effective_chat.id
        user_id = update.effective_user.id
        
        # Проверяем, является ли отправитель администратором
        is_admin_user = await self.is_admin(update, context)
        
        if is_admin_user:
            # Обработка сообщений от администратора
            await self.handle_admin_message(update, context, message_text, chat_id)
        else:
            # Обработка сообщений от участников
            await self.handle_user_message(update, context, message_text, chat_id, user_id)
    
    async def handle_admin_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE, 
                                  message_text: str, chat_id: int):
        """Обработка сообщений от администратора"""
        # Ищем все типы данных в сообщении
        extracted_data = {}
        
        # Поиск номера телефона
        phone_match = re.search(PHONE_REGEX, message_text)
        if phone_match:
            extracted_data['phone'] = phone_match.group()
        
        # Поиск номера карты
        card_match = re.search(CARD_REGEX, message_text)
        if card_match:
            extracted_data['card'] = card_match.group()
        
        # Поиск email
        email_match = re.search(EMAIL_REGEX, message_text)
        if email_match:
            extracted_data['email'] = email_match.group()
            # Отправляем подтверждение для email
            await update.message.reply_text("Записано")
        
        # Поиск суммы
        amount_match = re.search(AMOUNT_REGEX, message_text)
        if amount_match:
            extracted_data['amount'] = amount_match.group().replace('!', '')
        
        # Поиск банка
        bank_match = re.search(BANK_REGEX, message_text, re.IGNORECASE)
        if bank_match:
            extracted_data['bank'] = bank_match.group()
        
        # Если найдены какие-либо данные, сохраняем их
        if extracted_data:
            extracted_data['chat_id'] = chat_id
            extracted_data['message_id'] = update.message.message_id
            
            add_admin_data(extracted_data)
            logger.info(f"Admin data saved: {extracted_data}")
    
    async def handle_user_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE, 
                                 message_text: str, chat_id: int, user_id: int):
        """Обработка сообщений от участников"""
        user = update.effective_user
        lines = message_text.split('\n')
        
        extracted_data = {
            'user_id': user_id,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'chat_id': chat_id
        }
        
        # Обрабатываем каждую строку
        for line in lines:
            line = line.strip()
            
            # Проверяем ФИО
            if re.match(FIO_REGEX, line):
                extracted_data['fio'] = line
            
            # Проверяем номер карты (может быть с маской)
            elif re.search(r'\b\d{4}[\*]+\d{0,4}\b', line) or re.search(CARD_REGEX, line):
                extracted_data['card_number'] = line
            
            # Проверяем номер счета
            elif re.search(ACCOUNT_REGEX, line):
                extracted_data['account_number'] = line
            
            # Проверяем номер телефона
            elif re.search(PHONE_REGEX, line):
                extracted_data['phone'] = line
        
        # Сохраняем данные, если найдено хотя бы ФИО
        if 'fio' in extracted_data:
            add_user_data(extracted_data)
            logger.info(f"User data saved: {extracted_data}")
    
    async def error_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Обработчик ошибок"""
        logger.error(f"Update {update} caused error {context.error}")
    
    def run(self):
        """Запуск бота"""
        self.application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == '__main__':
    bot = TelegramBot()
    bot.run()