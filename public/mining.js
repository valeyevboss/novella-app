document.addEventListener('DOMContentLoaded', () => {
    // Получаем userId из URL (или создаём уникальный ключ для каждого пользователя)
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId'); // Получаем telegramId из параметров URL

    const startMiningBtn = document.getElementById('start-mining-btn');
    const timerDisplay = document.getElementById('timer-mining');
    let miningInterval;

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
            startTimer(); // Запускаем таймер

            // Обработка уведомления
            showNotification(data.message, true);
        } catch (error) {
            showNotification(error.message, false);
            console.error('Ошибка при запуске майнинга:', error);
        }
    });

// Функция для запуска таймера
function startTimer() {
    const miningDuration = 10 * 1000; // 10 секунд
    let remainingTime = miningDuration;

    miningInterval = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(miningInterval);
            startMiningBtn.textContent = 'Claim';
            startMiningBtn.disabled = false; // Активируем кнопку

            // Здесь можно добавить логику для получения токенов, например:
            startMiningBtn.addEventListener('click', async () => {
                const response = await fetch(`/mining-status/${telegramId}`);
                const statusData = await response.json();
                showNotification(statusData.message, true);
            });
        } else {
            remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
            const hours = String(Math.floor((remainingTime / (1000 * 60 * 60)) % 24)).padStart(2, '0');
            const minutes = String(Math.floor((remainingTime / (1000 * 60)) % 60)).padStart(2, '0');
            const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
            timerDisplay.textContent = `${hours}h ${minutes}m ${seconds}s`; // Обновляем отображение таймера
        }
    }, 1000); // Каждую секунду
}