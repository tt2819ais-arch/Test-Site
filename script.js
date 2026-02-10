// Конфигурация
const CONFIG = {
    API_KEY: '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',
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'TNG: DeepSeek R1T2 Chimera (free)',
    CHARACTERS: [
        {
            id: 1,
            name: ".ᅠᅠ",
            avatar: "👻",
            color: "#ff6b6b",
            tag: "Тихий хаос",
            bio: "Американский вайб на русском. Сарказм, мемы, случайные фразы. Всегда в теме, но делает вид что ему пофиг.",
            style: "Типа крутой пацан с американским вайбом. Использует сленг: 'бро', 'ф', 'черт', 'втф'. Любит мемы и сарказм. Отвечает коротко, но метко."
        },
        {
            id: 2,
            name: "Задира Боб",
            avatar: "😠",
            color: "#4cd964",
            tag: "Строгий но с юмором",
            bio: "Злой, строгий, угрожающий, но с юмором. Любит 'воспитывать' молодежь в своем стиле.",
            style: "Строгий и угрожающий, но с иронией. Говорит как учитель или старший брат. Использует угрозы в шутку, типа 'я тебе сейчас уши надеру'. Всегда с юмором, даже когда злится."
        },
        {
            id: 3,
            name: "Чилл Майк",
            avatar: "😎",
            color: "#5ac8fa",
            tag: "Расслабленный бро",
            bio: "Всегда чиллит, говорит медленно, использует 'братан', 'чувак'. Ничего не напрягает.",
            style: "Супер расслабленный. Всегда говорит 'братан', 'чувак', 'не парься'. Фразы типа 'все ок', 'расслабься', 'чиллим'. Много смайликов и мемных отсылок."
        }
    ]
};

// Состояние приложения
const state = {
    username: localStorage.getItem('9b_username') || null,
    messages: JSON.parse(localStorage.getItem('9b_messages')) || [],
    currentTab: 'chat',
    characters: CONFIG.CHARACTERS,
    isGenerating: false
};

// DOM элементы
const elements = {
    registrationScreen: document.getElementById('registration-screen'),
    mainInterface: document.getElementById('main-interface'),
    usernameInput: document.getElementById('username'),
    joinChatBtn: document.getElementById('join-chat-btn'),
    chatMessages: document.getElementById('chat-messages'),
    messageInput: document.getElementById('message-input'),
    sendBtn: document.getElementById('send-btn'),
    currentUsername: document.getElementById('current-username'),
    changeNameBtn: document.getElementById('change-name-btn'),
    clearChatBtn: document.getElementById('clear-chat-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    tabs: document.querySelectorAll('.tab'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    charactersList: document.querySelector('.characters-list'),
    notification: document.getElementById('notification')
};

// Инициализация приложения
function init() {
    // Загружаем сохраненные сообщения
    loadMessages();
    
    // Проверяем, зарегистрирован ли пользователь
    if (state.username) {
        showMainInterface();
        updateUsernameDisplay();
    } else {
        showRegistrationScreen();
    }
    
    // Загружаем персонажей
    loadCharacters();
    
    // Назначаем обработчики событий
    setupEventListeners();
    
    // Показываем приветственное сообщение
    if (state.messages.length === 0) {
        addSystemMessage('Добро пожаловать в 9B Legends! Начните общение с персонажами.');
    }
}

// Показать экран регистрации
function showRegistrationScreen() {
    elements.registrationScreen.classList.add('active');
    elements.mainInterface.classList.remove('active');
    elements.usernameInput.focus();
}

// Показать основной интерфейс
function showMainInterface() {
    elements.registrationScreen.classList.remove('active');
    elements.mainInterface.classList.add('active');
    elements.messageInput.focus();
}

// Обновить отображение имени пользователя
function updateUsernameDisplay() {
    if (elements.currentUsername) {
        elements.currentUsername.textContent = state.username;
    }
}

// Загрузить сообщения
function loadMessages() {
    elements.chatMessages.innerHTML = '';
    
    state.messages.forEach(msg => {
        if (msg.type === 'system') {
            addSystemMessage(msg.text, false);
        } else if (msg.type === 'user') {
            addUserMessage(msg.text, msg.sender, false);
        } else if (msg.type === 'bot') {
            addBotMessage(msg.text, msg.sender, msg.avatar, false);
        }
    });
    
    // Прокрутка вниз
    scrollToBottom();
}

// Загрузить персонажей
function loadCharacters() {
    if (!elements.charactersList) return;
    
    elements.charactersList.innerHTML = '';
    
    CONFIG.CHARACTERS.forEach(character => {
        const card = document.createElement('div');
        card.className = `character-card character${character.id}`;
        card.innerHTML = `
            <div style="display: flex; align-items: center;">
                <div class="character-avatar" style="background: ${character.color}">
                    ${character.avatar}
                </div>
                <div class="character-info">
                    <h3>${character.name}</h3>
                    <span class="character-tag">${character.tag}</span>
                    <p class="character-bio">${character.bio}</p>
                </div>
            </div>
        `;
        elements.charactersList.appendChild(card);
    });
}

// Назначить обработчики событий
function setupEventListeners() {
    // Кнопка входа в чат
    elements.joinChatBtn.addEventListener('click', joinChat);
    elements.usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinChat();
    });
    
    // Отправка сообщения
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Быстрые эмодзи
    document.querySelectorAll('.quick-emoji').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.messageInput.value += btn.dataset.emoji;
            elements.messageInput.focus();
        });
    });
    
    // Вкладки
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Кнопка смены имени
    elements.changeNameBtn.addEventListener('click', () => {
        state.username = null;
        localStorage.removeItem('9b_username');
        showRegistrationScreen();
    });
    
    // Очистка чата
    elements.clearChatBtn.addEventListener('click', clearChat);
    
    // Выход
    elements.logoutBtn.addEventListener('click', () => {
        state.username = null;
        state.messages = [];
        localStorage.clear();
        showRegistrationScreen();
        showNotification('Вы вышли из чата');
    });
    
    // Переключатели
    document.getElementById('notifications-toggle').addEventListener('change', function() {
        showNotification(this.checked ? 'Уведомления включены' : 'Уведомления выключены');
    });
    
    document.getElementById('theme-toggle').addEventListener('change', function() {
        document.body.style.background = this.checked 
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        showNotification(this.checked ? 'Темная тема включена' : 'Светлая тема включена');
    });
}

// Войти в чат
function joinChat() {
    const username = elements.usernameInput.value.trim();
    
    if (!username) {
        showNotification('Введи имя, бро!');
        elements.usernameInput.focus();
        return;
    }
    
    if (username.length < 2) {
        showNotification('Имя слишком короткое, минимум 2 символа');
        return;
    }
    
    if (username.length > 20) {
        showNotification('Имя слишком длинное, максимум 20 символов');
        return;
    }
    
    state.username = username;
    localStorage.setItem('9b_username', username);
    
    updateUsernameDisplay();
    showMainInterface();
    showNotification(`Добро пожаловать, ${username}!`);
    
    // Добавляем приветственное сообщение от персонажей
    setTimeout(() => {
        addSystemMessage(`${username} присоединился к чату!`);
        
        // Персонажи приветствуют нового пользователя
        setTimeout(() => {
            addBotMessage(`О, новый чел в чате! Привет, ${username}, бро! 👋`, ".ᅠᅠ", "👻");
            setTimeout(() => {
                addBotMessage(`Только без дурацких выходок, ${username}. А то буду воспитывать! 😠`, "Задира Боб", "😠");
                setTimeout(() => {
                    addBotMessage(`Расслабься, ${username}, все ок тут. Просто чиллим 😎`, "Чилл Майк", "😎");
                }, 800);
            }, 800);
        }, 500);
    }, 300);
}

// Переключить вкладку
function switchTab(tabName) {
    // Обновляем активную вкладку
    elements.tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    
    // Показываем соответствующую панель
    elements.tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabName}-tab`);
    });
    
    // Прокручиваем чат вниз при переключении
    if (tabName === 'chat') {
        setTimeout(scrollToBottom, 100);
    }
}

// Отправить сообщение
async function sendMessage() {
    const text = elements.messageInput.value.trim();
    
    if (!text) {
        showNotification('Напиши что-нибудь, бро!');
        return;
    }
    
    if (!state.username) {
        showNotification('Сначала зарегистрируйся!');
        return;
    }
    
    if (state.isGenerating) {
        showNotification('Подожди, персонажи думают...');
        return;
    }
    
    // Добавляем сообщение пользователя
    addUserMessage(text, state.username);
    elements.messageInput.value = '';
    
    // Показываем индикатор загрузки
    state.isGenerating = true;
    addSystemMessage('Персонажи думают над ответом...');
    
    try {
        // Генерируем ответы от всех персонажей
        await generateCharacterResponses(text);
    } catch (error) {
        console.error('Ошибка генерации ответов:', error);
        showNotification('Ошибка API, используем запасные ответы');
        
        // Запасные ответы
        setTimeout(() => {
            addBotMessage(`Норм тема, ${state.username}! Ф в чат 👻`, ".ᅠᅠ", "👻");
            setTimeout(() => {
                addBotMessage(`Что за бред ты несешь? Сядь, два! 😠`, "Задира Боб", "😠");
                setTimeout(() => {
                    addBotMessage(`Чувак, не парься, все гуд 😎`, "Чилл Майк", "😎");
                    state.isGenerating = false;
                }, 800);
            }, 800);
        }, 1000);
    }
}

// Сгенерировать ответы персонажей
async function generateCharacterResponses(userMessage) {
    const responses = [];
    
    // Для каждого персонажа
    for (const character of CONFIG.CHARACTERS) {
        try {
            const response = await generateAIResponse(userMessage, character);
            responses.push({
                character,
                response
            });
            
            // Добавляем сообщение с задержкой для реализма
            setTimeout(() => {
                addBotMessage(response, character.name, character.avatar);
                
                // После последнего персонажа убираем индикатор загрузки
                if (responses.length === CONFIG.CHARACTERS.length) {
                    const systemMessages = document.querySelectorAll('.message.system');
                    if (systemMessages.length > 0) {
                        systemMessages[systemMessages.length - 1].remove();
                    }
                    state.isGenerating = false;
                    scrollToBottom();
                }
            }, responses.length * 800);
            
        } catch (error) {
            console.error(`Ошибка генерации для ${character.name}:`, error);
            // Используем запасной ответ
            responses.push({
                character,
                response: getFallbackResponse(character, userMessage)
            });
        }
    }
}

// Сгенерировать ответ через AI API
async function generateAIResponse(userMessage, character) {
    const prompt = `Ты - ${character.name}, ${character.style}

Пользователь написал: "${userMessage}"

Ответь в стиле своего персонажа. Используй школьный сленг: "бро", "ф", "черт", "втф", "пёхнуть", мемные отсылки. 
Ответ должен быть коротким (1-2 предложения), живым и в стиле персонажа.
Не используй markdown, только текст.

Ответ:`;

    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://9b-legends-chat.com',
            'X-Title': '9B Legends Chat'
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 100,
            temperature: 0.9
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Запасной ответ (если API не работает)
function getFallbackResponse(character, userMessage) {
    const responses = {
        ".ᅠᅠ": [
            "Ф в чат, бро! 😎",
            "Норм тема, чел 👻",
            "Втф ты несешь? 🤔",
            "Черт, опять эта тема... 😂",
            "Бро, ты в курсе мемов? 🔥"
        ],
        "Задира Боб": [
            "Сядь, два! И не умничай! 😠",
            "Я тебе сейчас уши надеру за такое! 👊",
            "Что за бред? Иди уроки делай! 📚",
            "Молодежь пошла... совсем с ума посходили! 🤦‍♂️",
            "Повтори, только попробуй! 😡"
        ],
        "Чилл Майк": [
            "Расслабься, бро, все ок 😎",
            "Чиллим, не парься 🤙",
            "Все гуд, чувак, просто отдыхаем 🌴",
            "Забей, просто кайфуем 🍹",
            "Не напрягайся, все путем ✌️"
        ]
    };
    
    const charResponses = responses[character.name] || ["Норм тема!"];
    return charResponses[Math.floor(Math.random() * charResponses.length)];
}

// Добавить сообщение пользователя
function addUserMessage(text, sender = state.username, save = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-sender">${sender}</div>
            ${escapeHtml(text)}
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    
    elements.chatMessages.appendChild(messageElement);
    
    if (save) {
        state.messages.push({
            type: 'user',
            text: text,
            sender: sender,
            time: new Date().toISOString()
        });
        saveMessages();
    }
    
    scrollToBottom();
}

// Добавить сообщение бота
function addBotMessage(text, sender, avatar, save = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot';
    messageElement.innerHTML = `
        <div class="message-content">
            <div class="message-sender">
                <span style="color: ${getCharacterColor(sender)}; font-weight: bold;">${sender}</span>
            </div>
            ${escapeHtml(text)}
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;
    
    elements.chatMessages.appendChild(messageElement);
    
    if (save) {
        state.messages.push({
            type: 'bot',
            text: text,
            sender: sender,
            avatar: avatar,
            time: new Date().toISOString()
        });
        saveMessages();
    }
    
    scrollToBottom();
    
    // Воспроизводим звук уведомления (если включено)
    if (document.getElementById('notifications-toggle').checked) {
        playNotificationSound();
    }
}

// Добавить системное сообщение
function addSystemMessage(text, save = true) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message system';
    messageElement.innerHTML = `
        <div class="message-content">
            ${escapeHtml(text)}
        </div>
    `;
    
    elements.chatMessages.appendChild(messageElement);
    
    if (save) {
        state.messages.push({
            type: 'system',
            text: text,
            time: new Date().toISOString()
        });
        saveMessages();
    }
    
    scrollToBottom();
}

// Получить цвет персонажа
function getCharacterColor(name) {
    const character = CONFIG.CHARACTERS.find(c => c.name === name);
    return character ? character.color : '#667eea';
}

// Очистить чат
function clearChat() {
    if (!confirm('Точно очистить весь чат?')) return;
    
    state.messages = [];
    saveMessages();
    loadMessages();
    showNotification('Чат очищен');
}

// Сохранить сообщения
function saveMessages() {
    localStorage.setItem('9b_messages', JSON.stringify(state.messages));
}

// Прокрутить вниз
function scrollToBottom() {
    setTimeout(() => {
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }, 100);
}

// Показать уведомление
function showNotification(text, duration = 3000) {
    elements.notification.textContent = text;
    elements.notification.classList.add('show');
    
    setTimeout(() => {
        elements.notification.classList.remove('show');
    }, duration);
}

// Воспроизвести звук уведомления
function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        console.log('Audio not supported');
    }
}

// Получить текущее время
function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', init);

// Обновляем время в верхней панели
setInterval(() => {
    const timeElement = document.querySelector('.time');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }
}, 60000);
