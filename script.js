
const usernameInput = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');

let username = '';

// OpenRouter API
const API_KEY = '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';
const MODEL = 'TNG: DeepSeek R1T2 Chimera';

loginBtn.onclick = () => {
  username = usernameInput.value.trim();
  if(username) {
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    appendMessage('Система', `Добро пожаловать, ${username}!`);
  }
};

sendBtn.onclick = async () => {
  const msg = messageInput.value.trim();
  if(!msg) return;
  appendMessage(username, msg);
  messageInput.value = '';
  // Вызов нейронки
  const characters = ['Тема','.ᅠᅠ','Задира Боб'];
  for(const char of characters){
    const response = await fetch('https://api.openrouter.ai/v1/chat/completions', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':'Bearer '+API_KEY
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{role:'user', content: `${char} ответь на сообщение "${msg}" в своём стиле.`}]
      })
    });
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '...';
    appendMessage(char, text);
  }
};

function appendMessage(sender, text){
  const div = document.createElement('div');
  div.innerHTML = `<b>${sender}:</b> ${text}`;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}
