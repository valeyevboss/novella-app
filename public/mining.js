// Получаем идентификатор пользователя из URL
const queryParams = new URLSearchParams(window.location.search);
const userId = queryParams.get('userId');

// Элементы страницы
const timerElement = document.getElementById('timer');
const miningButton = document.getElementById('start-mining-btn');
const progressBarFill = document.querySelector('.progress-bar::before');

// Статус майнинга пользователя
let miningActive = false;
let miningEndTime = null;
const miningDuration = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах

// Функция для запуска майнинга
function startMining() {
    if (miningActive) return; // Если майнинг уже активен

    // Устанавливаем время окончания майнинга
    miningEndTime = Date.now() + miningDuration;
    miningActive = true;

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

        // Продолжаем обновление через 1 минуту
        setTimeout(updateMiningProgress, 60000); // Обновляем каждую минуту
    } else {
        // Майнинг завершен
        timerElement.textContent = '0h 00m';
        progressBarFill.style.width = '100%';

        // Меняем статус кнопки
        miningButton.textContent = 'Claim 100 $Novella';
        miningButton.disabled = false;
        miningButton.onclick = claimMiningReward;
    }
}

// Запрос на получение статуса майнинга с сервера
async function checkMiningStatus() {
    try {
        const response = await fetch(`/mining-status/${userId}`);
        const data = await response.json();

        if (data.miningActive) {
            miningEndTime = new Date(data.miningEndTime).getTime();
            miningActive = true;
            startMining();
        }
    } catch (error) {
        showNotification('Ошибка при получении статуса майнинга', false);
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
            miningButton.textContent = 'Start Mining';
            miningButton.onclick = startMining;
        } else {
            showNotification(data.message || 'Ошибка при получении награды', false);
        }
    } catch (error) {
        showNotification('Ошибка при получении награды', false);
        console.error('Ошибка при получении награды:', error);
    }
}

// Инициализация
checkMiningStatus();