// Конфигурация
const CONFIG = {
    API_KEY: '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', // Вставьте сюда ваш ключ
    API_URL: 'https://openrouter.ai/api/v1/chat/completions',
    MODEL: 'deepseek/deepseek-chat-v3-0324:free', // Более стабильная модель
    USE_API: true,
    CHARACTERS: [
        {
            id: 1,
            name: ".ᅠᅠ",
            avatar: "👻",
            color: "#ff6b6b",
            tag: "Тихий хаос",
            bio: "Американский вайб на русском. Сарказм, мемы, случайные фразы. Всегда в теме, но делает вид что ему пофиг.",
            style: "Ты крутой пацан с американским вайбом. Используй сленг: 'бро', 'ф', 'черт', 'втф', 'пёхнуть'. Люби мемы и сарказм. Отвечай коротко, но метко. Максимум 10 слов."
        },
        {
            id: 2,
            name: "Задира Боб",
            avatar: "😠",
            color: "#4cd964",
            tag: "Строгий но с юмором",
            bio: "Злой, строгий, угрожающий, но с юмором. Любит 'воспитывать' молодежь в своем стиле.",
            style: "Ты строгий и угрожающий, но с иронией. Говори как учитель или старший брат. Используй угрозы в шутку: 'я тебе сейчас уши надеру'. Всегда с юмором, даже когда злишься. Максимум 10 слов."
        },
        {
            id: 3,
            name: "Чилл Майк",
            avatar: "😎",
            color: "#5ac8fa",
            tag: "Расслабленный бро",
            bio: "Всегда чиллит, говорит медленно, использует 'братан', 'чувак'. Ничего не напрягает.",
            style: "Ты супер расслабленный. Всегда говори 'братан', 'чувак', 'не парься'. Фразы типа 'все ок', 'расслабься', 'чиллим'. Много смайликов. Максимум 10 слов."
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
    notification: document.getElementById('notification'),
    apiStatus: document.querySelector('.api-status')
};

// Инициализация приложения
function init() {
    console.log('Инициализация приложения...');
    
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
    
    // Проверяем API
    testAPI();
}

// Тестирование API
async function testAPI() {
    if (!CONFIG.USE_API) {
        console.log('API отключено в настройках');
        if (elements.apiStatus) {
            elements.apiStatus.textContent = 'Offline (запасной режим)';
            elements.apiStatus.style.background = '#ff6b6b';
        }
        return;
    }
    
    try {
        console.log('Тестирование API...');
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': '9B Legends Chat'
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [{ role: "user", content: "Привет" }],
                max_tokens: 10
            })
        });
        
        if (response.ok) {
            console.log('API работает!');
            if (elements.apiStatus) {
                elements.apiStatus.textContent = 'Online';
                elements.apiStatus.style.background = '#4cd964';
            }
        } else {
            console.error('API ошибка:', response.status);
            CONFIG.USE_API = false;
            if (elements.apiStatus) {
                elements.apiStatus.textContent = 'Ошибка API';
                elements.apiStatus.style.background = '#ff9500';
            }
        }
    } catch (error) {
        console.error('API недоступно:', error);
        CONFIG.USE_API = false;
        if (elements.apiStatus) {
            elements.apiStatus.textContent = 'Offline';
            elements.apiStatus.style.background = '#ff6b6b';
        }
    }
}

// Остальные функции остаются такими же, но обновим функцию generateAIResponse:

// Сгенерировать ответ через AI API
async function generateAIResponse(userMessage, character) {
    if (!CONFIG.USE_API) {
        throw new Error('API отключено');
    }

    const prompt = `Ты - ${character.name}. ${character.style}

Пользователь сказал: "${userMessage}"

Ответь в стиле своего персонажа. Используй школьный сленг. Будь естественным. Отвечай на русском.`;

    console.log(`Отправка запроса для ${character.name}:`, prompt.substring(0, 100) + '...');

    try {
        const response = await fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
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
                max_tokens: 50,
                temperature: 0.8,
                top_p: 0.9
            })
        });

        console.log('Статус ответа:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ошибка API:', errorText);
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Ответ API:', data);
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('Неверный формат ответа API');
        }
    } catch (error) {
        console.error(`Ошибка при запросе к API для ${character.name}:`, error);
        throw error;
    }
}

// Улучшенная функция для запасных ответов
function getFallbackResponse(character, userMessage) {
    const userMsg = userMessage.toLowerCase();
    
    // Разные ответы в зависимости от контекста
    if (userMsg.includes('привет') || userMsg.includes('хай') || userMsg.includes('здаров')) {
        return character.name === ".ᅠᅠ" ? "Хай, бро! 👻" :
               character.name === "Задира Боб" ? "Ну привет, только без дурацких выходок! 😠" :
               "Привет, чувак! Расслабься 😎";
    }
    
    if (userMsg.includes('как дела') || userMsg.includes('че как')) {
        return character.name === ".ᅠᅠ" ? "Норм, чиллим 😎" :
               character.name === "Задира Боб" ? "Дела? Уроки сделал? Нет? Вот и молчи! 📚" :
               "Все ок, братан, просто кайфуем 🌴";
    }
    
    if (userMsg.includes('школа') || userMsg.includes('урок')) {
        return character.name === ".ᅠᅠ" ? "Опять школа... ф 😒" :
               character.name === "Задира Боб" ? "Учиться надо, а не в чате сидеть! 🧠" :
               "Забей на школу, чувак, чиллим 😎";
    }
    
    // Общие случайные ответы
    const responses = {
        ".ᅠᅠ": [
            "Ф в чат! 🔥",
            "Норм тема, бро 👌",
            "Втф? Серьезно? 🤨",
            "Черт, ты прав... 😂",
            "Мемная тема! 📱",
            "Бро, это кринж... 🙈",
            "Ахаха, хорош! 🤣",
            "Понял, принял 🫡"
        ],
        "Задира Боб": [
            "Что за бред несешь? 🤨",
            "Сядь, два! И помолчи! 📝",
            "Молодой человек, это недопустимо! 👮",
            "Я тебе сейчас... ладно, шучу 😉",
            "Иди уроки делай лучше! 📚",
            "Опять ты со своими глупостями... 🤦‍♂️",
            "Так, прекрати это! ✋",
            "Воспитание нужно, вот что! 🧐"
        ],
        "Чилл Майк": [
            "Расслабься, бро 😌",
            "Все гуд, не парься 🤙",
            "Чиллим, все ок 🌊",
            "Просто кайфуем, чувак 🏖️",
            "Забей, не стоит нервов ✌️",
            "Все путем, расслабься 🍹",
            "Норм все, чувак 😊",
            "Просто отдыхай, братан 🎧"
        ]
    };
    
    const charResponses = responses[character.name] || ["Норм тема!"];
    return charResponses[Math.floor(Math.random() * charResponses.length)];
}

// Обновим функцию generateCharacterResponses для лучшей обработки ошибок:
async function generateCharacterResponses(userMessage) {
    const responses = [];
    
    // Сначала убираем индикатор загрузки
    const systemMessages = document.querySelectorAll('.message.system');
    if (systemMessages.length > 0) {
        systemMessages[systemMessages.length - 1].remove();
    }
    
    // Для каждого персонажа
    for (const character of CONFIG.CHARACTERS) {
        try {
            let response;
            
            if (CONFIG.USE_API) {
                response = await generateAIResponse(userMessage, character);
            } else {
                // Используем запасной режим
                response = getFallbackResponse(character, userMessage);
            }
            
            responses.push({
                character,
                response
            });
            
            // Добавляем сообщение с задержкой для реализма
            setTimeout(() => {
                addBotMessage(response, character.name, character.avatar);
                
                // Прокручиваем вниз после каждого сообщения
                scrollToBottom();
                
                // После последнего персонажа снимаем флаг генерации
                if (responses.length === CONFIG.CHARACTERS.length) {
                    state.isGenerating = false;
                }
            }, responses.length * 800);
            
        } catch (error) {
            console.error(`Ошибка генерации для ${character.name}:`, error);
            // Используем запасной ответ
            const fallbackResponse = getFallbackResponse(character, userMessage);
            responses.push({
                character,
                response: fallbackResponse
            });
            
            // Добавляем запасной ответ с задержкой
            setTimeout(() => {
                addBotMessage(fallbackResponse, character.name, character.avatar);
                scrollToBottom();
                
                if (responses.length === CONFIG.CHARACTERS.length) {
                    state.isGenerating = false;
                }
            }, responses.length * 800);
        }
    }
}

// В функции sendMessage добавим отладку:
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
    
    console.log('Отправка сообщения:', text);
    
    // Добавляем сообщение пользователя
    addUserMessage(text, state.username);
    elements.messageInput.value = '';
    
    // Показываем индикатор загрузки
    state.isGenerating = true;
    addSystemMessage('Персонажи думают над ответом...');
    
    // Генерируем ответы
    await generateCharacterResponses(text);
}

// Также добавьте эту функцию для отображения ошибок в чате:
function showErrorInChat(error) {
    addSystemMessage(`Ошибка: ${error}. Используем запасные ответы.`);
}

// И обновите функцию joinChat чтобы она проверяла API:
async function joinChat() {
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
    
    // Тестируем API при входе
    await testAPI();
    
    // Добавляем приветственные сообщения
    setTimeout(() => {
        addSystemMessage(`${username} присоединился к чату!`);
        
        // Персонажи приветствуют нового пользователя
        setTimeout(() => {
            if (!CONFIG.USE_API) {
                addSystemMessage('API недоступно. Используем запасные ответы.');
            }
            
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
