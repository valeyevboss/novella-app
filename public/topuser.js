// Массив с данными пользователей
const users = [
    { username: "Kira Princess", balance: "150,000", rank: "#1", avatar: "https://sun9-63.userapi.com/impg/TIpJIGYq1_oPXv71w2_8pP5W_i411FByDeGfxA/hzK7C9aRykc.jpg?size=799x800&quality=95&sign=216297ffd8f6f0ccdca6fd5dab00d67a&type=album" },
    { username: "Nikita Valeyev", balance: "120,000", rank: "#2", avatar: "https://sun9-43.userapi.com/impg/jcKq6UzBGPWmSDzURKj94cREpsRPkLMLTuRpeQ/Uq7RdTnncL4.jpg?size=810x1080&quality=95&sign=0e98642c4d7b442c31c8a38ca2653bf5&type=album" },
    // Добавь сюда остальных пользователей до 100
];

// Функция для создания блока пользователя
function createUserBlock(user) {
    const userBlock = document.createElement('div');
    userBlock.classList.add('user-info-block');
    
    userBlock.innerHTML = `
        <img src="${user.avatar}" alt="User Avatar" class="user-avatar">
        <div class="user-details">
            <span class="username">${user.username}</span>
            <span class="token-balance">${user.balance}</span>
        </div>
        <span class="user-rank">${user.rank}</span>
    `;
    
    return userBlock;
}

// Функция для рендеринга списка пользователей
function renderLeaderboard() {
    const leaderboardContainer = document.getElementById('leaderboard-container');
    
    users.forEach(user => {
        const userBlock = createUserBlock(user);
        leaderboardContainer.appendChild(userBlock);
    });
}

// Вызов функции для отображения пользователей
document.addEventListener('DOMContentLoaded', renderLeaderboard);
