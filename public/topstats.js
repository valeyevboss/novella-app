async function getYourStats() {
    try {
        const response = await fetch('/api/user-stats');
        if (!response.ok) {
            throw new Error('Сеть не отвечает');
        }
        const userStats = await response.json();
        displayYourStats(userStats);
    } catch (error) {
        console.error('Ошибка при получении статистики пользователя:', error);
    }
}

// Функция для отображения статистики пользователя
function displayYourStats(user) {
    const avatarUrl = user.avatarUrl ? user.avatarUrl : 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1727453958/default-avatar.png';
    
    // Обновляем блок пользователя
    document.querySelector('.user-avatar').src = avatarUrl;
    document.querySelector('.username').textContent = user.username;
    document.querySelector('.top-token-balance').textContent = user.tokens;
    document.querySelector('.user-rank').textContent = `#${user.rank}`;
}

// Вызов функции при загрузке страницы
window.onload = getYourStats;