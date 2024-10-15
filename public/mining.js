document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId');

    const startMiningBtn = document.getElementById('start-mining-btn');
    const timerDisplay = document.getElementById('timer-mining');
    const progressFill = document.querySelector('.progress-fill');
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
                showNotification(statusData.message, true);
                startMiningBtn.textContent = 'Start Mining'; 
                startMiningBtn.disabled = false; 
                progressFill.style.width = '0%'; 

                // Обновляем страницу после получения токенов
                location.reload();
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
                    throw new Error(errorData.error);
                }
    
                const data = await response.json();
                startMiningBtn.disabled = true; 
                startTimer(); 
            } catch (error) {
                console.error('Ошибка при запуске майнинга:', error);
            }
        }
    });
    
    function startTimer(duration) {
        let remainingTime = duration || 10 * 1000; // Если duration не передан, используем 10 секунд
        const miningDuration = 10 * 1000; // 10 секунд

        miningInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false;
                progressFill.style.width = '100%'; 
            } else {
                remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
                const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
                timerDisplay.textContent = `00:00:${seconds}`; 
                
                // Обновляем ширину прогресс-бара
                const progressPercentage = ((miningDuration - remainingTime) / miningDuration) * 100;
                progressFill.style.width = `${progressPercentage}%`; 
            }
        }, 1000);
    }
});