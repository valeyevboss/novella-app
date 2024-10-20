document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId'); // Получаем userId из параметров URL

    // Таймер на 30 секунд
    let timerValue = 30;
    const timerElement = document.getElementById('timer-game');
    const coinCountElement = document.getElementById('coinCount');

    // Функция для обновления таймера каждую секунду
    function startTimer() {
        const timerInterval = setInterval(() => {
            if (timerValue > 0) {
                timerValue--;
                let minutes = Math.floor(timerValue / 60);
                let seconds = timerValue % 60;
                timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            } else {
                clearInterval(timerInterval);
                showNotification('Время вышло!', true);

                // Запускаем таймер для перенаправления через 5 секунд
                setTimeout(() => {
                    window.location.href = `/index.html?userId=${telegramId}`;
                }, 5000); // 5000 миллисекунд = 5 секунд
            }
        }, 1000);
    }
    
    // Запуск таймера при загрузке страницы
    window.onload = startTimer;
});