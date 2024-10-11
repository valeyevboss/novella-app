async function getTopUsers() {
    try {
        const response = await fetch('/api/top-users');
        if (!response.ok) {
            throw new Error('Сеть не отвечает');
        }
        const topUsers = await response.json();
        displayTopUsers(topUsers);
        
        // Обновляем ранги после получения пользователей
        await updateRanks(); // Убедитесь, что эта функция доступна в текущем контексте

    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
    }
}

// Функция для форматирования баланса токенов
function formatTokenBalance(value) {
    // Преобразуем значение в строку и заменяем запятую на пробел
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " "); // Замените " " на "," для запятой
}

// Функция для отображения пользователей
function displayTopUsers(users) {
    const leaderboardContainer = document.querySelector('.top100-container');

    // Очищаем контейнер перед добавлением новых пользователей
    leaderboardContainer.innerHTML = '';

    users.forEach((user, index) => {
        const userBlock = document.createElement('div');
        userBlock.classList.add('top100-user-info-block');

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

        userBlock.innerHTML = `
            <img src="${avatarUrl}" alt="User Avatar" class="top100-user-avatar">
            <div class="top100-user-details">
                <span class="top100-username">${user.username}</span>
                <span class="top100-token-balance">${formatTokenBalance(user.tokens)} $Novella</span>
            </div>
            <span class="top100-user-rank">${rankIcon}${(index < 3) ? '' : ' #' + (index + 1)}</span>
        `;

        leaderboardContainer.appendChild(userBlock);
    });
}

// Вызов функции при загрузке страницы
window.onload = getTopUsers;