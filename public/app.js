const tonConnect = new TonConnect({
    // Здесь укажите параметры инициализации, если необходимо
    // Например, можно указать нужные версии
});

// Получаем кнопку подключения кошелька
const connectButton = document.getElementById('connectButton');
const warningBlock = document.querySelector('.airdrop-warning-block');

// Проверяем, поддерживает ли браузер локальное хранилище
if (typeof localStorage === 'undefined') {
    alert("Ваш браузер не поддерживает локальное хранилище. Пожалуйста, обновите браузер.");
}

// Проверка статуса подключения
const checkConnection = async () => {
    const connected = await tonConnect.isConnected();

    if (connected) {
        // Если подключен, скрываем предупреждение
        warningBlock.style.display = 'none';

        // Здесь можно добавить логику для работы с кошельком
        // Например, получить адрес или баланс
        const walletAddress = await tonConnect.getAccount(); // Получаем адрес кошелька
        console.log("Подключенный адрес:", walletAddress);

        // Загрузка баланса или других данных
        // Здесь можете вызвать свою функцию для получения баланса или транзакций
        // getBalance(walletAddress);
    } else {
        // Если не подключен, показываем кнопку
        connectButton.style.display = 'block';
    }
};

// Обработчик клика по кнопке подключения
connectButton.addEventListener('click', async () => {
    try {
        await tonConnect.connect(); // Подключаем кошелек
        checkConnection(); // Проверяем статус подключения
    } catch (error) {
        console.error("Ошибка подключения:", error);
        alert("Не удалось подключить кошелек. Пожалуйста, попробуйте еще раз.");
    }
});

// Проверяем подключение при загрузке страницы
window.onload = checkConnection;