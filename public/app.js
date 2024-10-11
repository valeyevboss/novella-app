window.addEventListener('load', function () { 
    let attempts = 0;
    const maxAttempts = 10;

    const checkSDK = setInterval(() => {
        if (window.TonConnectSDK && window.TonConnectSDK.TonConnect) {
            clearInterval(checkSDK);

            // Создаем инстанс TON Connect с конфигурацией
            const tonConnect = new window.TonConnectSDK.TonConnect({
                manifestUrl: 'https://novella-telegram-bot.onrender.com/tonconnect-manifest.json' // Путь к вашему манифесту
            });

            const connectButton = document.getElementById('connectButton');

            async function connectWallet() {
                try {
                    // Убедимся, что tonConnect подключен к источнику
                    const wallets = await tonConnect.getWallets();
                    if (wallets.length === 0) {
                        throw new Error("No wallets available for connection.");
                    }

                    await tonConnect.connect({bridgeUrl: "https://bridge.tonapi.io/"}); // Настройте bridgeUrl, если нужно
                    alert("Wallet connected successfully!");
                } catch (error) {
                    console.error("Error connecting wallet:", error);
                    alert("Failed to connect wallet. Please try again.");
                }
            }

            connectButton.addEventListener('click', connectWallet);
        } else {
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(checkSDK);
                console.error("TonConnect SDK is not available after multiple attempts.");
                alert("TonConnect SDK не доступен. Проверьте подключение к интернету.");
            }
        }
    }, 1000);
});