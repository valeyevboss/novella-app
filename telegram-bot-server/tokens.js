function fetchTokenBalance(telegramId) {
    fetch(`/api/get-balance/${telegramId}`)
        .then(response => response.json())
        .then(data => {
            // Обновляем отображаемый баланс на странице
            document.getElementById('token-balance').textContent = data.tokens;
        })
        .catch(error => console.error('Error fetching balance:', error));
}

// ID пользователя в Telegram
const telegramId = 'Ваш_telegramId';

// Проверяем баланс каждые 10 секунд (10000 мс)
setInterval(() => fetchTokenBalance(telegramId), 10000);
