const startMiningBtn = document.getElementById('start-mining-btn');
const claimMiningBtn = document.getElementById('claim-mining-btn'); 
const timerMiningDisplay = document.getElementById('timer-mining');
const userId = params.get('userId'); // Получаем userId из параметров URL
const miningStartTimeKey = `miningStartTime_${userId}`; // Уникальный ключ для времени старта майнинга

// Функция для запуска майнинга (начало отсчета таймера)
function startMining() {
    const miningStartTime = Date.now();
    localStorage.setItem(miningStartTimeKey, miningStartTime); // Сохраняем время начала майнинга
    startMiningBtn.disabled = true; // Блокируем кнопку Start Mining
    claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim, если она вдруг была видна

    startTimer(10); // Запускаем таймер на 10 секунд (для теста)
}

// Функция для начала обратного отсчета
function startTimer(duration) {
    let timer = duration;
    const countdownInterval = setInterval(() => {
        timerMiningDisplay.textContent = `Time left: ${timer}s`;
        if (--timer < 0) {
            clearInterval(countdownInterval);
            showClaimButton(); // Показываем кнопку Claim
        }
    }, 1000);
}

// Функция для показа кнопки Claim
function showClaimButton() {
    claimMiningBtn.style.display = 'block'; // Показываем кнопку Claim
    startMiningBtn.disabled = false; // Снова активируем кнопку Start Mining
}

// Функция для начисления награды (Claim)
async function claimReward() {
    const response = await fetch(`/add-tokens/${userId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: 100 }) // Начисляем 100 токенов
    });

    if (response.ok) {
        const data = await response.json();
        showNotification('You have received 100 tokens!', true); // Показываем уведомление
        animateClaimButton(); // Запускаем анимацию кнопки Claim
        claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim после начисления
        timerMiningDisplay.textContent = ''; // Сброс таймера
    } else {
        const errorData = await response.json();
        showNotification(`Error: ${errorData.error}`, false); // Показываем ошибку
    }
}

// Функция для анимации кнопки Claim
function animateClaimButton() {
    claimMiningBtn.classList.add('animate');
    setTimeout(() => {
        claimMiningBtn.classList.remove('animate');
    }, 700); // Время анимации (700 мс)
}

// Обработчики нажатий на кнопки
startMiningBtn.addEventListener('click', startMining);
claimMiningBtn.addEventListener('click', claimReward);

// Если время майнинга истекло (на случай перезагрузки страницы)
const savedMiningStartTime = localStorage.getItem(miningStartTimeKey);
if (savedMiningStartTime) {
    const timeElapsed = (Date.now() - savedMiningStartTime) / 1000;
    if (timeElapsed >= 10) {
        showClaimButton(); // Если прошло 10 секунд, показываем кнопку Claim
    } else {
        startTimer(10 - Math.floor(timeElapsed)); // Продолжаем отсчет
    }
}
