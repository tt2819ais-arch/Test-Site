// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация
    initApp();
    setupEventListeners();
    loadInitialData();
    
    // Автообновление каждые 30 секунд
    setInterval(loadData, 30000);
    
    // Запуск анимаций
    startAnimations();
});

// Инициализация приложения
function initApp() {
    // Скрыть загрузочный экран
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }
    
    // Активация текущей вкладки
    const currentPath = window.location.hash || '#dashboard';
    activateTab(currentPath.replace('#', ''));
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Обработчики вкладок
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.dataset.tab;
            activateTab(tabId);
            window.location.hash = tabId;
        });
    });
    
    // Обработчики кнопок вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            activateContentTab(tabId);
        });
    });
    
    // Кнопка обновления
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadData);
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Вы успешно вышли из системы', 'success');
            setTimeout(() => {
                window.location.href = '/logout';
            }, 1500);
        });
    }
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    
    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Закрытие мобильного меню при клике вне его
    document.addEventListener('click', function(e) {
        if (sidebar && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Активация вкладки
function activateTab(tabId) {
    // Деактивировать все вкладки
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Активировать выбранную вкладку
    const activeTab = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Показать соответствующий контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const activeContent = document.getElementById(`${tabId}-tab`);
    if (activeContent) {
        activeContent.style.display = 'block';
        activeContent.classList.add('active');
    }
}

// Активация контентных вкладок
function activateContentTab(tabId) {
    // Деактивировать все кнопки вкладок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Активировать выбранную кнопку
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Показать соответствующий контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tabId}-content`);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

// Загрузка начальных данных
function loadInitialData() {
    loadData();
    
    // Загрузка каждые 30 секунд
    setInterval(loadData, 30000);
}

// Загрузка данных с сервера
function loadData() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
        refreshBtn.disabled = true;
    }
    
    fetch('/api/data')
        .then(response => {
            if (!response.ok) throw new Error('Ошибка сети');
            return response.json();
        })
        .then(data => {
            updateUI(data);
            showNotification('Данные успешно обновлены', 'success');
            updateLastUpdateTime();
        })
        .catch(error => {
            console.error('Error loading data:', error);
            showNotification('Ошибка при загрузке данных', 'error');
        })
        .finally(() => {
            if (refreshBtn) {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
                refreshBtn.disabled = false;
            }
        });
}

// Обновление интерфейса
function updateUI(data) {
    // Обновление статистики
    updateStats(data);
    
    // Обновление таблиц
    updateTables(data);
    
    // Обновление графиков (если есть)
    updateCharts(data);
}

// Обновление статистики
function updateStats(data) {
    const adminCount = document.getElementById('admin-count');
    const userCount = document.getElementById('user-count');
    const totalCount = document.getElementById('total-count');
    
    if (adminCount) {
        adminCount.textContent = data.admin_data.length;
        animateCounter(adminCount, data.admin_data.length);
    }
    
    if (userCount) {
        userCount.textContent = data.user_data.length;
        animateCounter(userCount, data.user_data.length);
    }
    
    if (totalCount) {
        const total = data.admin_data.length + data.user_data.length;
        totalCount.textContent = total;
        animateCounter(totalCount, total);
    }
}

// Обновление таблиц
function updateTables(data) {
    // Таблица административных данных
    const adminTableBody = document.getElementById('admin-data-body');
    if (adminTableBody) {
        adminTableBody.innerHTML = data.admin_data.map((row, index) => `
            <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
                <td>${row.id}</td>
                <td>
                    <span class="badge badge-admin">
                        <i class="fas fa-user-shield"></i> Admin
                    </span>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-phone"></i>
                        <span>${row.phone || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-credit-card"></i>
                        <span>${row.card || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-envelope"></i>
                        <span>${row.email || '-'}</span>
                    </div>
                </td>
                <td>
                    ${row.amount ? `
                        <span class="badge badge-amount">
                            <i class="fas fa-ruble-sign"></i> ${row.amount}
                        </span>
                    ` : '-'}
                </td>
                <td>
                    ${row.bank ? `
                        <div class="data-cell">
                            <i class="fas fa-university"></i>
                            <span>${row.bank}</span>
                        </div>
                    ` : '-'}
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-clock"></i>
                        <span>${formatDate(row.created_at)}</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Таблица данных пользователей
    const userTableBody = document.getElementById('user-data-body');
    if (userTableBody) {
        userTableBody.innerHTML = data.user_data.map((row, index) => `
            <tr class="fade-in" style="animation-delay: ${index * 0.05}s">
                <td>${row.id}</td>
                <td>
                    <span class="badge badge-user">
                        <i class="fas fa-user"></i> User
                    </span>
                </td>
                <td>${row.user_id}</td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-user-circle"></i>
                        <span>${row.username || row.name || 'Anonymous'}</span>
                    </div>
                </td>
                <td>${row.fio || '-'}</td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-credit-card"></i>
                        <span>${row.card_number || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-file-invoice-dollar"></i>
                        <span>${row.account_number || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-phone"></i>
                        <span>${row.phone || '-'}</span>
                    </div>
                </td>
                <td>
                    <div class="data-cell">
                        <i class="fas fa-clock"></i>
                        <span>${formatDate(row.created_at)}</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Обновление времени последнего обновления
function updateLastUpdateTime() {
    const lastUpdateEl = document.getElementById('last-update');
    if (lastUpdateEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        lastUpdateEl.innerHTML = `<i class="fas fa-clock"></i> Последнее обновление: ${timeString}`;
    }
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Анимация счетчика
function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = target > current ? 1 : -1;
    let currentValue = current;
    
    const timer = setInterval(() => {
        currentValue += increment;
        element.textContent = currentValue;
        
        if (currentValue === target) {
            clearInterval(timer);
        }
    }, 20);
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Удалить старые уведомления
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создать новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon} notification-icon"></i>
        <div class="notification-content">
            <h4>${type === 'success' ? 'Успешно!' : 'Ошибка!'}</h4>
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Показать уведомление
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Запуск анимаций
function startAnimations() {
    // Анимация плавающих элементов
    const floatingElements = document.querySelectorAll('.logo-icon, .login-logo');
    floatingElements.forEach(el => {
        el.style.animationDelay = `${Math.random() * 2}s`;
    });
    
    // Эффект параллакса
    if (window.innerWidth > 768) {
        document.addEventListener('mousemove', parallaxEffect);
    }
}

// Эффект параллакса
function parallaxEffect(e) {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    const cards = document.querySelectorAll('.stat-card');
    cards.forEach(card => {
        const speed = 20;
        const x = (mouseX * speed) - (speed / 2);
        const y = (mouseY * speed) - (speed / 2);
        
        card.style.transform = `translate(${x}px, ${y}px)`;
    });
}

// Обновление графиков (заглушка)
function updateCharts(data) {
    // Здесь можно добавить создание графиков с помощью Chart.js
    // Пример: отображение статистики по дням
}

// Экспорт функций для глобального использования
window.showNotification = showNotification;
window.loadData = loadData;
window.activateTab = activateTab;