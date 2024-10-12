const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням

// Получаем userId из URL (или создаём уникальный ключ для каждого пользователя)
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL
const rewardIndexKey = `rewardIndex_${userId}`; // Уникальный ключ для индекса награды
const lastClaimTimeKey = `lastClaimTime_${userId}`; // Уникальный ключ для времени последнего получения награды

let currentRewardIndex = parseInt(localStorage.getItem(rewardIndexKey)) || 0; // Индекс текущей награды

const rewardButton = document.getElementById('claim-reward-button');
const timerDisplay = document.getElementById('timer');

// Проверяем, заблокирована ли кнопка (если прошло меньше 24 часов)
const lastClaimTime = localStorage.getItem(lastClaimTimeKey);
if (lastClaimTime && (Date.now() - lastClaimTime < 86400000)) { // 86400000 миллисекунд = 24 часа
    const remainingTime = 86400000 - (Date.now() - lastClaimTime); // Оставшееся время до разблокировки
    disableRewardButton(remainingTime / 1000); // Запускаем таймер с оставшимся временем
} else {
    updateRewardButton(); // Обновляем кнопку, если можно получить награду
}

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
                currentRewardIndex = 0; // Сбрасываем индекс после последнего бонуса
            }
            localStorage.setItem(rewardIndexKey, currentRewardIndex); // Сохраняем индекс текущей награды для конкретного пользователя
            localStorage.setItem(lastClaimTimeKey, Date.now()); // Сохраняем время получения награды для конкретного пользователя
            updateRewardButton();
            disableRewardButton(86400); // Блокируем кнопку на 24 часа
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
        // Показываем таймер и иконку, если пользователь ещё не нажимал на кнопку
        document.querySelector('.timer-container').classList.remove('hidden');

    } else {
        rewardButton.disabled = true; // Отключаем кнопку, если награды закончились
    }
}

// Функция для сброса кнопки после истечения времени
function resetReward() {
    rewardButton.disabled = false; // Включаем кнопку
    if (currentRewardIndex >= rewards.length) {
        currentRewardIndex = 0; // Сбрасываем индекс награды на 0 при начале новой недели
        localStorage.setItem(rewardIndexKey, currentRewardIndex); // Сохраняем сброс в localStorage
    }
    updateRewardButton(); // Обновляем текст кнопки на следующий уровень награды
    timerDisplay.textContent = '00:00:00'; // Сброс таймера
}

// Инициализация
updateRewardButton(); // Устанавливаем начальный текст кнопки