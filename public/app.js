// Проверяем, доступен ли объект TonConnect
const TonConnect = window.TonConnect ? new window.TonConnect() : null;

if (TonConnect) {
    // Получаем элемент кнопки
    const connectButton = document.getElementById('connectButton');

    // Функция для подключения к кошельку
    async function connectWallet() {
        try {
            // Подключаем кошелек
            await TonConnect.connectWallet();
            // Успешное подключение
            alert("Wallet connected successfully!");
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Failed to connect wallet. Please try again.");
        }
    }

    // Привязываем обработчик клика к кнопке
    connectButton.addEventListener('click', connectWallet);
} else {
    console.error("TonConnect SDK is not available.");
}
