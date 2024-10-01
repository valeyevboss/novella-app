async function getTopUsers() {
    try {
        const response = await fetch('/api/top-users');
        if (!response.ok) {
            throw new Error('Сеть не отвечает');
        }
        const topUsers = await response.json();
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
        // Проверка на наличие аватарки, если нет — использовать дефолтную
        const avatarUrl = user.avatarUrl ? user.avatarUrl : 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1727453958/default-avatar.png';

        // Определяем значок на основе индекса
        let rankIcon = '';
        if (index === 0) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727726249/Pin/Gold-pin.png" alt="Top 1" class="rank-icon">';
        } else if (index === 1) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727725289/Pin/Silver-pin.png" alt="Top 2" class="rank-icon">';
        } else if (index === 2) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727725289/Pin/Bronze-pin.png" alt="Top 3" class="rank-icon">';
        }

        // Создаем блок для каждого пользователя
        const userBlock = document.createElement('div');
        userBlock.classList.add('top100-user-info-block');

        userBlock.innerHTML = `
            <img src="${avatarUrl}" alt="User Avatar" class="top100-user-avatar">
            <div class="top100-user-details">
                <span class="top100-username">${user.username}</span>
            </div>
            <div class="top100-token-details">
                <span class="top100-token-balance">${user.tokens}</span>
                <img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1725622251/novellacoin.png" alt="Token Icon" class="top100-token-icon">
            </div>
            <span class="top100-user-rank">${rankIcon} #${index + 1}</span>
        `;

        leaderboardContainer.appendChild(userBlock);
    });

    document.body.appendChild(leaderboardContainer);
}

// Вызов функции при загрузке страницы
window.onload = getTopUsers;