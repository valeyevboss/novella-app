document.addEventListener('DOMContentLoaded', function () {
    // Получаем Telegram ID из URL
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('telegramId');

    if (!telegramId) {
        console.error('Telegram ID не передан в URL');
        return; // Выход, если Telegram ID отсутствует
    }

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
