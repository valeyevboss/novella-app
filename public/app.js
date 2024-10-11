window.addEventListener('load', function () { 
    let attempts = 0;
    const maxAttempts = 10;

    const checkSDK = setInterval(() => {
        if (window.TonConnectSDK && window.TonConnectSDK.TonConnect) {
            clearInterval(checkSDK);

            // Создаем инстанс TON Connect через правильное пространство имен
            const tonConnect = new window.TonConnectSDK.TonConnect();

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
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(checkSDK);
                console.error("TonConnect SDK is not available after multiple attempts.");
                alert("TonConnect SDK не доступен. Проверьте подключение к интернету.");
            }
        }
    }, 1000);
});
