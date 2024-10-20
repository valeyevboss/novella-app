document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');

    // Таймер на 5 секунд для отсчета
    let countdownValue = 5;
    const countdownElement = document.getElementById('countdown');
    const letsGoElement = document.getElementById('lets-go');

    // Функция для воспроизведения звука
    function playSound() {
        const audio = new Audio('/sound/сountdown.wav'); // Укажите путь к вашему звуковому файлу
        audio.play();
    }

    // Функция для обновления таймера отсчета каждую секунду
    function startCountdown() {
        countdownElement.style.display = 'block'; // Показываем элемент отсчета
        const countdownInterval = setInterval(() => {
            if (countdownValue > 0) {
                countdownElement.textContent = countdownValue;
                playSound(); // Воспроизводим звук
                countdownValue--;
            } else {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none'; // Скрываем элемент отсчета
                letsGoElement.style.display = 'block'; // Показываем текст "Let’s Go!"
                playSound(); // Воспроизводим звук

                // Анимация "Let’s Go!"
                setTimeout(() => {
                    letsGoElement.style.display = 'none'; // Скрываем текст
                    startGame(); // Запускаем основную игру
                }, 1000); // Ждем 1 секунду перед началом игры
            }
        }, 1000);
    }

    // Функция для запуска основной игры
    function startGame() {
        // Отобразить HUD плавно с анимацией
        const hud = document.querySelector('.hud-game');
        hud.style.transform = 'translateY(-100%)'; // Перемещаем HUD вверх за экран
        hud.style.transition = 'transform 0.5s ease-in-out'; // Плавная анимация
        setTimeout(() => {
            hud.style.transform = 'translateY(0)'; // Возвращаем HUD на место
        }, 50); // Ждем небольшую задержку для анимации
       
        // Таймер на 30 секунд
        let timerValue = 30;
        const timerElement = document.getElementById('timer-game');
        
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

    // Запуск отсчета при загрузке страницы
    window.onload = startCountdown;
});
