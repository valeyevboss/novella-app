document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');

    const response = await fetch(`/api/coins-check/${telegramId}`);
    if (!response.ok) {
        console.error('Ошибка при получении данных пользователя:', await response.text());
        return; // Выход из функции, если запрос не успешен
    }
    
    const user = await response.json();
    const coinCountElement = document.querySelector('.coinCountBalanceСount'); // Убедись, что этот элемент существует

    // Проверка на существование элемента
    if (!coinCountElement) {
        console.error('Элемент с классом "coinCountBalanceСount" не найден');
        return; // Завершаем выполнение, если элемент не найден
    }

    coinCountElement.textContent = user.coinCount; // Теперь coinCountElement доступен

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
        const updatedUserResponse = await fetch(`/api/exchange/${telegramId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ coinAmount: inputValue, tokensReceived }),
        });

        const updatedUser = await updatedUserResponse.json();

        if (updatedUserResponse.ok) {
            const notificationMessage = `Поздравляем ${user.username}, вы обменяли ${inputValue} coins на ${tokensReceived} $Novella`;
            showNotification(notificationMessage, true);
            
            // Обновляем баланс на странице
            coinCountElement.textContent = updatedUser.coinCount; // Убедись, что updatedUser.coinCount корректно обновлён
            coinAmountInput.value = ''; // Очищаем поле ввода
            exchangeButton.disabled = true; // Деактивируем кнопку
        } else {
            // Здесь можно добавить обработку ошибок
            showNotification(updatedUser.message, false);
        }
    });
});