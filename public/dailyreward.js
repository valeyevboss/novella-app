const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням
let currentRewardIndex = parseInt(localStorage.getItem('rewardIndex')) || 0; // Индекс текущей награды
const rewardButton = document.getElementById('claim-reward-button');
const timerDisplay = document.getElementById('timer');

// Получение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Проверяем, заблокирована ли кнопка (если прошло меньше 10 секунд)
const lastClaimTime = localStorage.getItem('lastClaimTime');

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

// Функция блокировки кнопки на указанное количество секунд
function disableRewardButton(duration) {
    rewardButton.disabled = true; // Отключаем кнопку
    startTimer(duration); // Запускаем таймер
}

// Функция для обновления награды и отправки запроса на сервер
async function claimReward() {
    if (rewardButton.disabled) {
        return; // Если кнопка уже заблокирована, ничего не делаем
    }

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
            if (currentRewardIndex >= rewards.length) {
                // Если получили последнюю награду, сбрасываем индекс на 0 (новый цикл)
                currentRewardIndex = 0;
                alert('Новая неделя! Бонусы сброшены до 100 $Novella.');
            }

            localStorage.setItem('rewardIndex', currentRewardIndex); // Сохраняем индекс текущей награды
            localStorage.setItem('lastClaimTime', Date.now()); // Сохраняем время получения награды
            updateRewardButton();
            disableRewardButton(10); // Блокируем кнопку на 10 секунд (для тестирования)
        } else {
            const errorData = await response.json();
            alert(`Ошибка: ${errorData.error}`);
        }
    } else {
        alert('Вы уже получили все награды!');
        rewardButton.disabled = true; // Отключаем кнопку, если награды закончились
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
    updateRewardButton(); // Обновляем текст кнопки на следующий уровень награды
    timerDisplay.textContent = '00:00:10'; // Сброс таймера (для тестирования)
}

// Инициализация при загрузке страницы
function initializeDailyReward() {
    // Если последний раз награда была получена более чем 10 секунд назад, активируем кнопку
    if (lastClaimTime && (Date.now() - lastClaimTime < 10000)) { 
        const remainingTime = 10000 - (Date.now() - lastClaimTime); // Оставшееся время до разблокировки
        disableRewardButton(remainingTime / 1000); // Запускаем таймер с оставшимся временем
    } else {
        updateRewardButton(); // Обновляем кнопку, если можно получить награду
        rewardButton.disabled = false; // Убедитесь, что кнопка активна при загрузке, если нет таймера
    }
}

// Инициализация
initializeDailyReward();