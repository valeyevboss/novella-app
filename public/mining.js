document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId');

    const startMiningBtn = document.getElementById('start-mining-btn');
    const timerDisplay = document.getElementById('timer-mining');
    const progressFill = document.querySelector('.progress-fill');
    let miningInterval;

    // Проверяем статус майнинга при загрузке страницы
    const savedTime = localStorage.getItem('remainingTime');
    const savedMiningActive = localStorage.getItem('miningActive');

    if (savedMiningActive === 'true' && savedTime) {
        startMiningBtn.textContent = 'Claim';
        startMiningBtn.disabled = false;
        startTimer(parseInt(savedTime)); // Запускаем таймер с сохраненным временем
    } else {
        const response = await fetch(`/mining-status/${telegramId}`);
        const statusData = await response.json();

        if (statusData.miningActive) {
            startMiningBtn.textContent = 'Claim';
            startMiningBtn.disabled = false;
            startTimer(statusData.remainingTime);
        }
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
                localStorage.removeItem('remainingTime');
                localStorage.removeItem('miningActive');
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

        localStorage.setItem('miningActive', true); // Сохраняем статус майнинга

        miningInterval = setInterval(() => {
            if (remainingTime <= 0) {
                clearInterval(miningInterval);
                startMiningBtn.textContent = 'Claim';
                startMiningBtn.disabled = false;
                progressFill.style.width = '100%';
                localStorage.removeItem('remainingTime'); // Удаляем оставшееся время из localStorage
            } else {
                remainingTime -= 1000; // Уменьшаем оставшееся время на 1 секунду
                localStorage.setItem('remainingTime', remainingTime); // Сохраняем оставшееся время
                const seconds = String(Math.floor((remainingTime / 1000) % 60)).padStart(2, '0');
                timerDisplay.textContent = `00:00:${seconds}`;

                // Обновляем ширину прогресс-бара
                const progressPercentage = ((miningDuration - remainingTime) / miningDuration) * 100;
                progressFill.style.width = `${progressPercentage}%`;
            }
        }, 1000);
    }
});