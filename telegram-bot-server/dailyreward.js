let dayCounter = 1;
const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням
let timerInterval;
let isRewardClaimed = false;

// Функция для обновления кнопки и награды
function updateButton() {
    const button = document.getElementById('claim-reward-button');
    if (dayCounter > rewards.length) {
        dayCounter = 1;
    }
    button.innerText = `Daily Check in +${rewards[dayCounter - 1]} $Novella`;
}

// Функция получения награды
function claimReward() {
    if (isRewardClaimed) return;
    console.log('Кнопка нажата, начинаем получение награды');

    const rewardAmount = rewards[dayCounter - 1];
    const userId = '<%= userId %>'; // Используем userId из шаблона

    if (!userId) {
        console.error('User ID не найден');
        return;
    }

    fetch(`/add-tokens/${userId}`, {
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

    let timeLeft = 24 * 60 * 60; // 24 часа

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRewardClaimed = false;
            document.getElementById('claim-reward-button').disabled = false;
            dayCounter++;
            updateButton();
        }
    }, 1000);
}

// Инициализация
window.onload = function() {
    updateButton();
}