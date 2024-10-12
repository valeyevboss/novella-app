const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням
let currentRewardIndex = 0; // Индекс текущей награды
const rewardButton = document.getElementById('claim-reward-button');
const timerDisplay = document.getElementById('timer');

// Получение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Функция для начала обратного отсчета
function startTimer(duration) {
    let timer = duration, hours, minutes, seconds;
    const countdownInterval = setInterval(() => {
        hours = parseInt(timer / 3600, 10);
        minutes = parseInt((timer % 3600) / 60, 10);
        seconds = parseInt(timer % 60, 10);

        // Добавление нуля перед числами меньше 10
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        timerDisplay.textContent = `${hours}:${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(countdownInterval);
            resetReward(); // Сброс кнопки после истечения времени
        }
    }, 1000);
}

// Функция для обновления награды и отправки запроса на сервер
async function claimReward() {
    if (currentRewardIndex < rewards.length) {
        const rewardAmount = rewards[currentRewardIndex];

        // Отправка POST запроса на сервер для добавления токенов
        const response = await fetch(`/add-tokens/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: rewardAmount })
        });

        if (response.ok) {
            const data = await response.json();
            alert(`Вы получили ${rewardAmount} $Novella!`);
            currentRewardIndex++; // Переход к следующей награде
            updateRewardButton();
            startTimer(86400); // Запуск таймера на 24 часа (86400 секунд)
        } else {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.error}`);
        }
    } else {
        alert('Вы уже получили все награды!');
    }
}

// Функция для обновления текста на кнопке
function updateRewardButton() {
    if (currentRewardIndex < rewards.length) {
        rewardButton.textContent = `Daily Check in +${rewards[currentRewardIndex]} $Novella`;
    } else {
        rewardButton.disabled = true; // Отключаем кнопку, если награды закончились
    }
}

// Функция для сброса кнопки после истечения времени
function resetReward() {
    rewardButton.disabled = false; // Включаем кнопку
    currentRewardIndex = 0; // Сбрасываем индекс награды
    updateRewardButton(); // Обновляем текст кнопки
    timerDisplay.textContent = '24:00:00'; // Сброс таймера
}

// Инициализация
updateRewardButton(); // Устанавливаем начальный текст кнопки
