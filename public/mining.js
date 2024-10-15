document.addEventListener("DOMContentLoaded", function() {
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    // Элементы страницы
    const timerElement = document.getElementById('timer-mining');
    const miningButton = document.getElementById('start-mining-btn');
    const progressBarFill = document.querySelector('.progress-fill');

    // Статус майнинга пользователя
    let miningActive = false;
    let miningEndTime = null;
    const miningDuration = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах

    // Проверяем состояние майнинга из локального хранилища
    const storedEndTime = localStorage.getItem('miningEndTime');
    if (storedEndTime) {
        miningEndTime = parseInt(storedEndTime);
        miningActive = Date.now() < miningEndTime; // Проверяем, активен ли майнинг
        if (miningActive) {
            startMining(); // Если активен, запускаем майнинг
        }
    }

    // Функция для запуска майнинга
    function startMining() {
        if (miningActive) return; // Если майнинг уже активен

        // Устанавливаем время окончания майнинга
        miningEndTime = Date.now() + miningDuration;
        miningActive = true;

        // Сохраняем время окончания в локальное хранилище
        localStorage.setItem('miningEndTime', miningEndTime);

        // Обновляем UI
        miningButton.textContent = 'Mining...';
        miningButton.disabled = true;

        // Запускаем таймер обновления
        updateMiningProgress();
    }

    // Обновление прогресса майнинга
    function updateMiningProgress() {
        const remainingTime = miningEndTime - Date.now();

        if (remainingTime > 0) {
            // Обновляем таймер на UI
            const hours = Math.floor(remainingTime / (60 * 60 * 1000));
            const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
            timerElement.textContent = `${hours}h ${minutes}m`;

            // Обновляем прогрессбар
            const progressPercent = ((miningDuration - remainingTime) / miningDuration) * 100;
            progressBarFill.style.width = `${progressPercent}%`;

            // Продолжаем обновление каждую секунду
            setTimeout(updateMiningProgress, 1000);
        } else {
            // Майнинг завершен
            timerElement.textContent = '0h 00m';
            progressBarFill.style.width = '100%';

            // Меняем статус кнопки
            miningButton.textContent = 'Claim 100 $Novella';
            miningButton.disabled = false;
            miningButton.onclick = claimMiningReward;

            // Удаляем время окончания из локального хранилища
            localStorage.removeItem('miningEndTime');
            miningActive = false; // Сбрасываем статус
        }
    }

    // Запрос на получение статуса майнинга с сервера
    async function checkMiningStatus() {
        try {
            const response = await fetch(`/mining-status/${userId}`);
            const data = await response.json();
    
            console.log('Mining status from server:', data);
    
            if (data.miningActive) {
                miningEndTime = new Date(data.miningEndTime).getTime();
                miningActive = true;
                startMining();
            } else {
                console.log('Mining is not active, resetting...');
                resetMining();
            }
        } catch (error) {
            console.error('Ошибка при получении статуса майнинга:', error);
        }
    }    

    // Функция для получения награды
    async function claimMiningReward() {
        try {
            const response = await fetch(`/claim-mining/${userId}`, {
                method: 'POST'
            });

            const data = await response.json();

            if (data.success) {
                // Обновляем баланс на странице
                showNotification('Поздравляем! Вы получили 100 $Novella.', true);
                resetMining(); // Сбрасываем состояние майнинга
            } else {
                showNotification(data.message || 'Ошибка при получении награды', false);
            }
        } catch (error) {
            showNotification('Ошибка при получении награды', false);
            console.error('Ошибка при получении награды:', error);
        }
    }

    // Функция для сброса состояния майнинга
    function resetMining() {
        miningButton.textContent = 'Start Mining';
        miningButton.disabled = false;
        miningButton.onclick = startMining; // Восстанавливаем обработчик события
        localStorage.removeItem('miningEndTime'); // Удаляем время окончания из локального хранилища
        timerElement.textContent = '12h 00m'; // Сбрасываем таймер на начальное значение
        progressBarFill.style.width = '0%'; // Сбрасываем прогресс бар
        miningActive = false; // Сбрасываем статус
    }

    // Инициализация
    checkMiningStatus();

    // Назначаем событие для кнопки после полной загрузки DOM
    miningButton.addEventListener('click', startMining);
});