document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId'); // Получаем telegramId из параметров URL

    const startMiningBtn = document.getElementById('start-mining-btn');
    const timerDisplay = document.getElementById('timer-mining');
    let miningInterval;

    // Загрузка состояния из localStorage
    const miningState = JSON.parse(localStorage.getItem('miningState'));
    if (miningState && miningState.telegramId === telegramId) {
        startMiningBtn.disabled = true; // Деактивируем кнопку
        startTimer(miningState.startTime); // Запускаем таймер с сохраненного времени
    }

    startMiningBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/start-mining/${telegramId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error); // Обработка ошибок
            }

            const data = await response.json();
            startMiningBtn.disabled = true; // Деактивируем кнопку
            localStorage.setItem('miningState', JSON.stringify({ telegramId, startTime: Date.now() })); // Сохраняем состояние

            startTimer(Date.now()); // Запускаем таймер

            showNotification(data.message, true);
        } catch (error) {
            showNotification(error.message, false);
            console.error('Ошибка при запуске майнинга:', error);
        }
    });

    // Функция для запуска таймера
    function startTimer(startTime) {
        const miningDuration = 12 * 60 * 60 * 1000; // 12 часов
        let remainingTime = miningDuration;

        // Определяем время завершения майнинга
        const miningEndTime = startTime + miningDuration;

        miningInterval = setInterval(() => {
            const currentTime = Date.now();
            remainingTime = miningEndTime - currentTime; // Обновляем оставшееся время

            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false; // Активируем кнопку

                // Здесь можно добавить логику для получения токенов, например:
                startMiningBtn.addEventListener('click', async () => {
                    const response = await fetch(`/mining-status/${telegramId}`);
                    const statusData = await response.json();
                    showNotification(statusData.message, true);
                    localStorage.removeItem('miningState'); // Удаляем состояние после получения токенов
                });
            } else {
                const hours = String(Math.floor((remainingTime / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                const minutes = String(Math.floor((remainingTime / (1000 * 60)) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
                timerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`; // Обновляем отображение таймера
            }
        }, 1000); // Каждую секунду
    }
});