document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');

    // Получаем текущее значение coinCount из базы данных
    const response = await fetch(`/api/check-user/${telegramId}`);
    const user = await response.json();
    const coinCountElement = document.querySelector('.coinCountBalanceСount');
    coinCountElement.textContent = user.coinCount;

    const exchangeButton = document.getElementById('exchange-button');
    const coinAmountInput = document.getElementById('coinAmount');

    coinAmountInput.addEventListener('input', () => {
        const inputValue = parseInt(coinAmountInput.value, 10);
        const currentCoins = user.coinCount;

        // Проверяем, может ли пользователь обменять введенное значение
        if (inputValue >= 5 && inputValue <= currentCoins && inputValue % 5 === 0) {
            exchangeButton.disabled = false;
        } else {
            exchangeButton.disabled = true;
        }
    });

    exchangeButton.addEventListener('click', async () => {
        const inputValue = parseInt(coinAmountInput.value, 10);
        const tokensReceived = inputValue / 5; // Каждые 5 коинов = 1 токен

        // Обновляем баланс пользователя
        const updatedUser = await fetch(`/api/exchange/${telegramId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinAmount: inputValue, tokensReceived }),
        });

        const notificationMessage = `Поздравляем ${user.username}, вы обменяли ${inputValue} coins на ${tokensReceived} $Novella`;
        showNotification(notificationMessage, true);

        // Обновляем баланс на странице
        coinCountElement.textContent = updatedUser.coinCount;
        coinAmountInput.value = ''; // Очищаем поле ввода
        exchangeButton.disabled = true; // Деактивируем кнопку
    });
});