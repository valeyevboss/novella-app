window.addEventListener('load', function () { 
    // Ждем загрузки страницы
    let attempts = 0;
    const maxAttempts = 10; // Максимальное количество попыток

    const checkSDK = setInterval(() => {
        if (window.TonConnect) {
            clearInterval(checkSDK);

            // Создаем инстанс TON Connect
            const tonConnect = new window.TonConnect();

            // Получаем элемент кнопки
            const connectButton = document.getElementById('connectButton');

            // Функция для подключения к кошельку
            async function connectWallet() {
                try {
                    // Подключаем кошелек
                    await tonConnect.connect();
                    // Успешное подключение
                    alert("Wallet connected successfully!");
                    // Дополнительные действия после подключения
                } catch (error) {
                    console.error("Error connecting wallet:", error);
                    alert("Failed to connect wallet. Please try again.");
                }
            }

            // Привязываем обработчик клика к кнопке
            connectButton.addEventListener('click', connectWallet);
        } else {
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(checkSDK);
                console.error("TonConnect SDK is not available after multiple attempts.");
                alert("TonConnect SDK не доступен. Пожалуйста, проверьте подключение к интернету или URL SDK.");
            }
        }
    }, 1000); // Проверяем наличие SDK каждую секунду
});
