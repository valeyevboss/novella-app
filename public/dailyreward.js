let dayCounter = localStorage.getItem('dayCounter') ? parseInt(localStorage.getItem('dayCounter')) : 1;
const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням
let timerInterval;
let isRewardClaimed = localStorage.getItem('isRewardClaimed') === 'true';
let timeLeft = localStorage.getItem('timeLeft') ? parseInt(localStorage.getItem('timeLeft')) : 24 * 60 * 60; // Время, оставшееся с предыдущей сессии

// Извлечение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Функция для обновления кнопки и награды
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
}

// Функция получения награды
function claimReward() {
    if (isRewardClaimed) return;

    console.log('Кнопка нажата, начинаем получение награды');
    const rewardAmount = rewards[dayCounter - 1];

    fetch(`/add-tokens/${userId}`, {  // Используем userId
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokens: rewardAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isRewardClaimed = true;
            localStorage.setItem('isRewardClaimed', 'true');
            document.getElementById('claim-reward-button').disabled = true;
            console.log('Награда получена');
            startTimer();
        } else {
            console.error('Ошибка при получении награды:', data.error);
        }
    })
    .catch(error => console.error('Ошибка при запросе на получение награды:', error));
}

// Функция для таймера
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
            isRewardClaimed = false;
            localStorage.setItem('isRewardClaimed', 'false');
            document.getElementById('claim-reward-button').disabled = false;
            dayCounter++;
            localStorage.setItem('dayCounter', dayCounter);
            updateButton();
            timeLeft = 24 * 60 * 60; // Сбросить таймер на 24 часа
            localStorage.setItem('timeLeft', timeLeft);
        }
    }, 1000);
}

// Инициализация
window.onload = function() {
    updateButton();
    if (isRewardClaimed && timeLeft > 0) {
        startTimer(); // Запустить таймер при загрузке страницы, если награда была получена
    }
}