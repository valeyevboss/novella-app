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
        if (startMiningBtn.textContent === 'Claim') {
            const response = await fetch(`/mining-status/${telegramId}`);
            const statusData = await response.json();
    
            // Проверяем, получили ли мы токены
            if (statusData.message) {
                showNotification(statusData.message, true); // Отображаем уведомление
                startMiningBtn.textContent = 'Start Mining'; // Сбрасываем текст кнопки
                startMiningBtn.disabled = false; // Активируем кнопку для повторного использования
                timerDisplay.textContent = '00:00:00'; // Сбрасываем таймер
            }
        } else {
            // Запуск майнинга
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
            } catch (error) {
                console.error('Ошибка при запуске майнинга:', error);
            }
        }
    });    

    function startTimer() {
        const miningDuration = 10 * 1000; // 10 секунд
        let remainingTime = miningDuration;
    
        miningInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false; // Активируем кнопку
            } else {
                remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
                const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
                timerDisplay.textContent = `00:00:${seconds}`; // Обновляем отображение таймера
            }
        }, 1000); // Каждую секунду
    }    
});