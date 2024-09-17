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
    console.log('Кнопка нажата, начинаем получение награды'); // Добавь лог

    const rewardAmount = rewards[dayCounter - 1];
    const telegramId = getTelegramId(); // Используем telegramId
	console.log('Telegram ID:', telegramId);

    if (!telegramId) {
        console.error('Telegram ID не найден');
        return;
    }

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
			console.log('Кнопка была нажата');
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

    let timeLeft = 24 * 60 * 60;

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;

        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        console.log(`Осталось времени: ${hours}:${minutes}:${seconds}`);

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
