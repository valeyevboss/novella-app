let dayCounter = localStorage.getItem('dayCounter') ? parseInt(localStorage.getItem('dayCounter')) : 1;
const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням
let timerInterval;
let premiumTimerInterval;
let isRewardClaimed = localStorage.getItem('isRewardClaimed') === 'true';
let timeLeft = localStorage.getItem('timeLeft') ? parseInt(localStorage.getItem('timeLeft')) : 24 * 60 * 60; // Время, оставшееся с предыдущей сессии

// Для премиум-награды
let isPremiumRewardClaimed = localStorage.getItem('isPremiumRewardClaimed') === 'true';
let premiumTimeLeft = localStorage.getItem('premiumTimeLeft') ? parseInt(localStorage.getItem('premiumTimeLeft')) : 7 * 24 * 60 * 60; // Неделя

// Извлечение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Функция для обновления кнопок награды
function updateButton() {
    const button = document.getElementById('claim-reward-button');
    if (dayCounter > rewards.length) {
        dayCounter = 1;
    }
    button.innerText = `Daily Check in +${rewards[dayCounter - 1]} $Novella`;

    if (isRewardClaimed) {
        button.disabled = true;
        startTimer();
    } else {
        button.disabled = false;
    }

    // Обновление кнопки премиум-награды
    const premiumButton = document.getElementById('premium-reward-button');
    if (isPremiumRewardClaimed) {
        premiumButton.disabled = true;
        startPremiumTimer();
    } else {
        checkPremiumStatus();
    }
}

// Проверка премиум-статуса пользователя
async function checkPremiumStatus() {
    try {
        const response = await fetch(`/check-premium/${userId}`);
        const data = await response.json();
        
        const premiumButton = document.getElementById('premium-reward-button');
        if (data.isPremium) {
            premiumButton.disabled = isPremiumRewardClaimed;
        } else {
            premiumButton.disabled = true; // Отключаем кнопку, если у пользователя нет премиума
        }
    } catch (error) {
        console.error('Ошибка при проверке премиум-статуса:', error);
    }
}

// Функция получения обычной награды
function claimReward() {
    if (isRewardClaimed) return; // Проверка, была ли уже получена награда

    console.log('Кнопка нажата, начинаем получение награды');
    const rewardAmount = rewards[dayCounter - 1];

    fetch(`/add-tokens/${userId}`, {  // Используем userId
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rewardAmount }), // Изменено на 'amount'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isRewardClaimed = true; // Устанавливаем статус награды
            localStorage.setItem('isRewardClaimed', 'true');
            document.getElementById('claim-reward-button').disabled = true; // Блокируем кнопку
            console.log('Награда получена');
            startTimer(); // Запускаем таймер
        } else {
            console.error('Ошибка при получении награды:', data.error);
        }
    })
    .catch(error => console.error('Ошибка при запросе на получение награды:', error));
}

// Функция получения премиум-награды
function claimPremiumReward() {
    if (isPremiumRewardClaimed) return;

    console.log('Премиум-кнопка нажата, начинаем получение премиум-награды');
    const rewardAmount = 1000; // Премиум награда

    fetch(`/add-tokens/${userId}`, {  // Используем userId
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rewardAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isPremiumRewardClaimed = true;
            localStorage.setItem('isPremiumRewardClaimed', 'true');
            document.getElementById('premium-reward-button').disabled = true;
            console.log('Премиум-награда получена');
            startPremiumTimer();
        } else {
            console.error('Ошибка при получении премиум-награды:', data.error);
        }
    })
    .catch(error => console.error('Ошибка при запросе на получение премиум-награды:', error));
}

// Таймер для обычной награды
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    if (!timerDisplay) {
        console.error('Таймер не найден на странице');
        return;
    }

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        localStorage.setItem('timeLeft', timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Обновляем состояние награды и кнопок
            isRewardClaimed = false; // Разрешаем получение награды
            localStorage.setItem('isRewardClaimed', 'false');
            document.getElementById('claim-reward-button').disabled = false; // Активируем кнопку
            dayCounter++;
            localStorage.setItem('dayCounter', dayCounter);
            updateButton(); // Обновляем текст кнопки

            // Сбросить таймер на 24 часа
            timeLeft = 24 * 60 * 60; 
            localStorage.setItem('timeLeft', timeLeft);
        }
    }, 1000);
}

// Таймер для премиум-награды
function startPremiumTimer() {
    const premiumTimerDisplay = document.getElementById('premium-timer');
    if (!premiumTimerDisplay) {
        console.error('Таймер премиум не найден на странице');
        return;
    }

    clearInterval(premiumTimerInterval);
    premiumTimerInterval = setInterval(() => {
        premiumTimeLeft--;

        const days = Math.floor(premiumTimeLeft / (24 * 3600));
        const hours = Math.floor((premiumTimeLeft % (24 * 3600)) / 3600);
        const minutes = Math.floor((premiumTimeLeft % 3600) / 60);
        const seconds = premiumTimeLeft % 60;

        premiumTimerDisplay.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        localStorage.setItem('premiumTimeLeft', premiumTimeLeft);

        if (premiumTimeLeft <= 0) {
            clearInterval(premiumTimerInterval);
            isPremiumRewardClaimed = false;
            localStorage.setItem('isPremiumRewardClaimed', 'false');
            document.getElementById('premium-reward-button').disabled = false;
            premiumTimeLeft = 7 * 24 * 60 * 60; // Сбросить таймер на неделю
            localStorage.setItem('premiumTimeLeft', premiumTimeLeft);
            updateButton();
        }
    }, 1000);
}

// Инициализация
window.onload = function() {
    updateButton(); // Обновляем состояние кнопок
    if (isRewardClaimed && timeLeft > 0) {
        startTimer(); // Запускаем таймер при загрузке, если награда была получена
    }
    if (isPremiumRewardClaimed && premiumTimeLeft > 0) {
        startPremiumTimer(); // Запускаем таймер для премиум, если награда была получена
    }
}
