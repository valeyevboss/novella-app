// mining.js
document.addEventListener('DOMContentLoaded', () => {
    const startMiningBtn = document.getElementById('start-mining-btn');
    const miningTimerDisplay = document.getElementById('timer-mining'); // Имя переменной для таймера
    let miningInterval;
    let remainingTime = 0;

    // Получаем userId из URL
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId'); // Получаем userId из параметров URL

    startMiningBtn.addEventListener('click', async () => {
        // Запускаем майнинг
        try {
            const response = await fetch(`/start-mining/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Ошибка при запуске майнинга');
            }

            const data = await response.json();
            remainingTime = 12 * 60 * 60 * 1000; // Устанавливаем время 12 часов
            startMiningBtn.disabled = true; // Делаем кнопку неактивной
            startCountdown(); // Запускаем обратный отсчет
        } catch (error) {
            showNotification(error.message, false);
        }
    });

    function startCountdown() {
        miningInterval = setInterval(async () => {
            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false; // Активируем кнопку для получения токенов

                startMiningBtn.addEventListener('click', async () => {
                    // Получение токенов
                    try {
                        const response = await fetch(`/mining-status/${userId}`);
                        if (!response.ok) {
                            throw new Error('Ошибка при получении статуса майнинга');
                        }

                        const data = await response.json();
                        showNotification(data.message, true);
                        resetMining(); // Сбрасываем состояние майнинга
                    } catch (error) {
                        showNotification(error.message, false);
                    }
                });
            } else {
                remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
                updateTimerDisplay();
            }
        }, 1000); // Каждую секунду обновляем таймер
    }

    function updateTimerDisplay() {
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
        const seconds = Math.floor((remainingTime / 1000) % 60);
        miningTimerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`; // Обновляем текст таймера
    }

    function resetMining() {
        startMiningBtn.textContent = 'Start Mining';
        startMiningBtn.disabled = false; // Снова активируем кнопку
        remainingTime = 0;
        clearInterval(miningInterval);
        miningTimerDisplay.textContent = '12h 00m'; // Сбрасываем текст таймера
    }
});