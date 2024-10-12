const rewards = [100, 250, 500, 750, 800, 900, 1500]; // Награды по дням

// Извлечение userId из URL
const params = new URLSearchParams(window.location.search);
const userId = params.get('userId'); // Получаем userId из параметров URL

// Очистка localStorage и установка начальных значений при входе с новым аккаунтом
if (localStorage.getItem('userId') !== userId) {
    localStorage.clear(); // Очищаем все значения в localStorage, чтобы сбросить состояние
    
    // Сохраняем текущий userId
    localStorage.setItem('userId', userId); 
    // Инициализация значений в sessionStorage
    sessionStorage.setItem('dayCounter', 1);
    sessionStorage.setItem('isRewardClaimed', 'false');
    sessionStorage.setItem('timeLeft', 24 * 60 * 60); // 24 часа в секундах
}

// Инициализация значений
let dayCounter = parseInt(sessionStorage.getItem('dayCounter')) || 1;
let isRewardClaimed = sessionStorage.getItem('isRewardClaimed') === 'true';
let timeLeft = parseInt(sessionStorage.getItem('timeLeft')) || 24 * 60 * 60; // 24 часа в секундах

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
            sessionStorage.setItem('isRewardClaimed', 'true'); // Сохраняем в sessionStorage
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
        sessionStorage.setItem('timeLeft', timeLeft); // Сохраняем оставшееся время в sessionStorage

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            isRewardClaimed = false; // Разрешаем получение награды
            sessionStorage.setItem('isRewardClaimed', 'false'); // Обновляем статус в sessionStorage
            document.getElementById('claim-reward-button').disabled = false; // Активируем кнопку
            dayCounter++;
            sessionStorage.setItem('dayCounter', dayCounter); // Обновляем dayCounter в sessionStorage
            updateButton(); // Обновляем текст кнопки
            timeLeft = 24 * 60 * 60; // Сбросить таймер на 24 часа
            sessionStorage.setItem('timeLeft', timeLeft); // Сохраняем новое значение таймера
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
