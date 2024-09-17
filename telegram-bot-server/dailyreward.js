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
    if (isRewardClaimed) return; // Если награда уже была получена
    
    const rewardAmount = rewards[dayCounter - 1];
    const telegramId = 'Твой telegramId'; // Здесь можешь подставить актуальный telegramId

    fetch(`/update-tokens/${telegramId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: rewardAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            isRewardClaimed = true;
            document.getElementById('claim-reward-button').disabled = true;
            startTimer(); // Запускаем таймер
        }
    })
    .catch(error => console.error('Error claiming reward:', error));
}

// Функция для таймера
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    let timeLeft = 24 * 60 * 60; // 24 часа в секундах

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRewardClaimed = false; // Сбрасываем флаг получения награды
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
