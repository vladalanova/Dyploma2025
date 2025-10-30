const API_URL = 'http://localhost:3000/api';

// Перевірка чи користувач авторизований
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        redirectToLogin();
        return false;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!data.success) {
            redirectToLogin();
            return false;
        }
        
        // Показуємо інформацію про користувача
        displayUserInfo(data.user);
        return true;
        
    } catch (error) {
        console.error('Auth check error:', error);
        redirectToLogin();
        return false;
    }
}

// Перенаправлення на сторінку входу
function redirectToLogin() {
    if (window.location.pathname !== '/login.html') {
        window.location.href = 'login.html';
    }
}

// Відображення інформації про користувача
function displayUserInfo(user) {
    const username = user.Username || localStorage.getItem('username');
    const role = user.Role || localStorage.getItem('userRole');
    
    // Додаємо панель користувача в header
    const container = document.querySelector('.container');
    if (container && !document.getElementById('user-panel')) {
        const userPanel = document.createElement('div');
        userPanel.id = 'user-panel';
        userPanel.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: #f9f9f9;
            border-bottom: 1px solid #ddd;
            margin-bottom: 15px;
        `;
        
        userPanel.innerHTML = `
            <div style="font-size: 14px; color: #333;">
                👤 <strong>${username}</strong> (${role})
            </div>
            <button onclick="logout()" style="padding: 5px 15px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 13px;">
                Вийти
            </button>
        `;
        
        container.insertBefore(userPanel, container.firstChild);
    }
}

// Вихід з системи
async function logout() {
    const token = localStorage.getItem('authToken');
    
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    // Очищаємо localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    
    // Перенаправляємо на логін
    window.location.href = 'login.html';
}

// Отримати токен для API запитів
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Перевірка при завантаженні сторінки
if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    checkAuth();
}