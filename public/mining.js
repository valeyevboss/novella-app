document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId');

    const startMiningBtn = document.getElementById('start-mining-btn');
    const timerDisplay = document.getElementById('timer-mining');
    let miningInterval;

    // Проверяем статус майнинга при загрузке страницы
    const response = await fetch(`/mining-status/${telegramId}`);
    const statusData = await response.json();

    if (statusData.miningActive) {
        // Если майнинг активен, показываем оставшееся время
        startMiningBtn.textContent = 'Claim';
        startMiningBtn.disabled = false; // Активируем кнопку
        startTimer(statusData.remainingTime); // Запускаем таймер
    }

    startMiningBtn.addEventListener('click', async () => {
        const response = await fetch(`/mining-status/${telegramId}`);
        const statusData = await response.json();

        if (statusData.miningActive) {
            // Если майнинг еще активен
            showNotification('Mining is still active!', false);
        } else {
            // Если время майнинга истекло
            showNotification(statusData.message, true);
            startMiningBtn.textContent = 'Start Mining'; // Сбрасываем кнопку
            startMiningBtn.disabled = false; // Активируем кнопку
        }
    });

    // Функция для запуска таймера
    function startTimer(remainingTime) {
        miningInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false; // Активируем кнопку
            } else {
                remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
                const hours = String(Math.floor((remainingTime / (1000 * 60 * 60)) % 24)).padStart(2, '0');
                const minutes = String(Math.floor((remainingTime / (1000 * 60)) % 60)).padStart(2, '0');
                const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
                timerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`; // Обновляем отображение таймера
            }
        }, 1000); // Каждую секунду
    }
});