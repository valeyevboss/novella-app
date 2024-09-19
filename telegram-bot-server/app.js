document.addEventListener('DOMContentLoaded', function () {
    const telegramId = '<user_telegram_id>'; // Telegram ID пользователя должен быть динамическим
    const tokenBalanceElement = document.getElementById('token-balance');

    function updateBalance() {
        fetch(`/get-balance/${telegramId}`)
            .then(response => response.json())
            .then(data => {
                if (data.tokens !== undefined) {
                    tokenBalanceElement.textContent = data.tokens;
                }
            })
            .catch(error => console.error('Ошибка при обновлении баланса:', error));
    }

    // Обновляем баланс каждые 10 секунд
    setInterval(updateBalance, 10000);

    // Первоначальная загрузка баланса при загрузке страницы
    updateBalance();
});
