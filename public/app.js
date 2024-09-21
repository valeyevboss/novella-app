// Ждем загрузки страницы
window.addEventListener('load', function () {
    const checkTonConnect = setInterval(() => {
        if (window.TonConnect) {
            clearInterval(checkTonConnect);
            const tonConnect = new window.TonConnect();
            const connectButton = document.getElementById('connectButton');

            async function connectWallet() {
                try {
                    await tonConnect.connect();
                    alert("Wallet connected successfully!");
                } catch (error) {
                    console.error("Error connecting wallet:", error);
                    alert("Failed to connect wallet. Please try again.");
                }
            }

            connectButton.addEventListener('click', connectWallet);
        } else {
            console.error("TonConnect SDK is still not available.");
        }
    }, 1000); // Проверка каждые 1000 мс (1 секунда)
});
