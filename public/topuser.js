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
    const leaderboardContainer = document.querySelector('.top100-container');
    
    let userListHTML = ''; // Собираем HTML для всех пользователей в один общий блок

    users.forEach((user, index) => {
        // Проверка на наличие аватарки, если нет — использовать дефолтную
        const avatarUrl = user.avatarUrl ? user.avatarUrl : 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1727453958/default-avatar.png';

        // Добавляем информацию о каждом пользователе в общий HTML
        userListHTML += `
            <div class="top100-user-info-block">
                <img src="${avatarUrl}" alt="User Avatar" class="top100-user-avatar">
                <div class="top100-user-details">
                    <span class="top100-username">${user.username}</span>
                    <span class="top100-token-balance">${user.tokens}</span>
                </div>
                <span class="top100-user-rank">#${index + 1}</span>
            </div>
        `;
    });

    // Вставляем весь собранный HTML в контейнер
    leaderboardContainer.innerHTML = userListHTML;
}

// Вызов функции при загрузке страницы
window.onload = getTopUsers;
