const mongoose = require('mongoose');
const User = require('./models/User'); // Импортируем модель User

// Функция для получения топ-100 пользователей
async function getTopUsers() {
    try {
        const topUsers = await User.find().sort({ tokens: -1 }).limit(100); // Сортировка по токенам, по убыванию
        displayTopUsers(topUsers);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
    }
}

// Функция для отображения пользователей
function displayTopUsers(users) {
    const leaderboardContainer = document.createElement('div');
    leaderboardContainer.classList.add('top100-container');

    users.forEach((user, index) => {
        const userBlock = document.createElement('div');
        userBlock.classList.add('top100-user-info-block');

        userBlock.innerHTML = `
            <img src="${user.avatarUrl}" alt="User Avatar" class="top100-user-avatar">
            <div class="top100-user-details">
                <span class="top100-username">${user.username}</span>
                <span class="top100-token-balance">${user.tokens}</span>
            </div>
            <span class="top100-user-rank">#${index + 1}</span>
        `;

        leaderboardContainer.appendChild(userBlock);
    });

    document.body.appendChild(leaderboardContainer);
}

// Вызов функции при загрузке страницы
window.onload = getTopUsers;
