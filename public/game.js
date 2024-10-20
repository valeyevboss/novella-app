document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');
    let gameActive = true; // Флаг активности игры

    // Таймер на 5 секунд для отсчета
    let countdownValue = 5;
    const countdownElement = document.getElementById('countdown');
    const letsGoElement = document.getElementById('lets-go');

    // Функция для воспроизведения звука
    function playSound() {
        const audio = new Audio('/sound/сountdown.wav'); // Укажите путь к вашему звуковому файлу
        audio.play();
    }

    // Функция для генерации монеток
    function createCoin() {
        if (!gameActive) return; // Останавливаем генерацию монет, если игра не активна

        const coin = document.createElement('img');
        coin.src = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1729431942/Game/Novella-coin.png';
        coin.classList.add('coin');
        document.body.appendChild(coin);

        // Генерируем случайные параметры для падения монеты
        coin.style.left = Math.random() * window.innerWidth + 'px';
        coin.style.animationDuration = Math.random() * 2 + 4 + 's'; // Падение от 4 до 6 секунд

        // Удаление монетки после окончания анимации
        coin.addEventListener('animationend', () => {
            coin.remove();
        });

        // Увеличение счета за каждую упавшую монету
        coin.addEventListener('click', () => {
            // Воспроизведение звука монеты
            const coinSound = new Audio('/sound/coin.wav');
            coinSound.play();

            let coinCountElement = document.getElementById('coinCount');
            let currentCoins = parseInt(coinCountElement.textContent, 10);
            coinCountElement.textContent = currentCoins + 2; // Добавляем 2 монеты
            coin.remove(); // Удаляем монету после нажатия
        });

        // Генерация монеток каждые 200 мс
        if (gameActive) {
            setTimeout(createCoin, 200); // Интервал появления новых монет
        }
    }

    // Функция для отправки данных в базу по окончании игры
    async function saveBalanceToDatabase() {
        try {
            console.log(`Saving balance for userId: ${telegramId} with coins: ${coinBalance}`);
            const response = await fetch('/save-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    telegramId: telegramId,
                    coins: coinBalance
                })
            });
            if (!response.ok) {
                console.error('Ошибка при сохранении баланса:', response.statusText);
            } else {
                console.log('Баланс успешно сохранен');
            }
        } catch (error) {
            console.error('Ошибка при отправке данных:', error);
        }
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
        gameActive = true; // Включаем активность игры

        // Отобразить HUD плавно с анимацией
        const hud = document.querySelector('.hud-game');
        hud.style.transform = 'translateY(-120%)'; // Перемещаем HUD немного выше за экран
        hud.style.opacity = '1'; // Показать HUD
        hud.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out'; // Плавная анимация

        setTimeout(() => {
            hud.style.transform = 'translateY(0)'; // Возвращаем HUD на место
        }, 50); // Небольшая задержка для анимации

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
                gameActive = false; // Игра завершена, останавливаем генерацию монет
                showNotification('Time is up, the main menu will load in a couple of seconds!', true);
                
                // Сохранить результат в базу данных
                saveBalanceToDatabase();

                // Останавливаем генерацию монет после окончания времени
                setTimeout(() => {
                    const coins = document.querySelectorAll('.coin');
                    coins.forEach(coin => coin.remove()); // Удаляем все оставшиеся монеты
                }, 500); // Даем 0.5 секунды для завершения текущей анимации монет

                // Запускаем таймер для перенаправления через 5 секунд
                setTimeout(() => {
                    window.location.href = `/index.html?userId=${telegramId}`;
                }, 5000); // 5000 миллисекунд = 5 секунд
            }
        }, 1000);

        // Начать генерацию монеток
        createCoin();
    }

    // Запуск отсчета при загрузке страницы
    window.onload = startCountdown;
});