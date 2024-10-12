async function getYourStats() {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId'); // Получаем userId из параметров URL

    try {
        const response = await fetch(`/api/top-stats/${userId}`); // Добавили userId в путь
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

    // Форматируем баланс с пробелами и добавляем префикс
    document.querySelector('.top-token-balance').textContent = formatBalance(user.tokens) + ' $Novella';
    document.querySelector('.user-rank').textContent = `#${user.rank}`;
}

// Функция для форматирования баланса с пробелами
function formatBalance(balance) {
    return balance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Добавляем пробелы через каждые три цифры
}

// Вызов функции при загрузке страницы
window.onload = getYourStats;