const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням

// Извлечение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Сброс значений при входе с новым аккаунтом
if (localStorage.getItem('userId') !== userId) {
    // Сброс всех значений
    localStorage.clear(); 
    localStorage.setItem('userId', userId); // Сохраняем текущий userId
    // Установка начальных значений
    localStorage.setItem('dayCounter', 1);
    localStorage.setItem('isRewardClaimed', 'false');
    localStorage.setItem('timeLeft', 24 * 60 * 60); // 24 часа в секундах
}

// Инициализация значений
let dayCounter = parseInt(localStorage.getItem('dayCounter')) || 1;
let isRewardClaimed = localStorage.getItem('isRewardClaimed') === 'true';
let timeLeft = parseInt(localStorage.getItem('timeLeft')) || 24 * 60 * 60; // 24 часа в секундах

// Обновление кнопок награды
function updateButton() {
    const button = document.getElementById('claim-reward-button');
    if (dayCounter > rewards.length) {
        dayCounter = 1;
    }
    button.innerText = `Daily Check in +${rewards[dayCounter - 1]} $Novella`;
    button.disabled = isRewardClaimed; // Упрощаем условие
}

// Функция получения обычной награды
function claimReward() {
    if (isRewardClaimed) return; // Проверка, была ли уже получена награда

    const rewardAmount = rewards[dayCounter - 1];

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
            isRewardClaimed = true; // Устанавливаем статус награды
            localStorage.setItem('isRewardClaimed', 'true'); // Сохраняем в localStorage
            document.getElementById('claim-reward-button').disabled = true; // Блокируем кнопку
            startTimer(); // Запускаем таймер
        } else {
            console.error('Ошибка при получении награды:', data.error);
        }
    })
    .catch(error => console.error('Ошибка при запросе на получение награды:', error));
}

// Таймер для обычной награды
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;

        // Обновление отображения таймера
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        localStorage.setItem('timeLeft', timeLeft); // Сохраняем оставшееся время в localStorage

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRewardClaimed = false; // Разрешаем получение награды
            localStorage.setItem('isRewardClaimed', 'false'); // Обновляем статус в localStorage
            document.getElementById('claim-reward-button').disabled = false; // Активируем кнопку
            dayCounter++;
            localStorage.setItem('dayCounter', dayCounter); // Обновляем dayCounter в localStorage
            updateButton(); // Обновляем текст кнопки
            timeLeft = 24 * 60 * 60; // Сбросить таймер на 24 часа
            localStorage.setItem('timeLeft', timeLeft); // Сохраняем новое значение таймера
        }
    }, 1000);
}

// Инициализация
window.onload = function() {
    updateButton(); // Обновляем состояние кнопок
    if (isRewardClaimed && timeLeft > 0) {
        startTimer(); // Запускаем таймер при загрузке, если награда была получена
    }
}