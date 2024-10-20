document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');
    let coinBalance = 0; // Начальный баланс для игры

    // Таймер на 5 секунд для отсчета
    let countdownValue = 5;
    const countdownElement = document.getElementById('countdown');
    const letsGoElement = document.getElementById('lets-go');
    const coinCountElement = document.getElementById('coinCount');

    // Функция для воспроизведения звука
    function playSound() {
        const audio = new Audio('/sound/сountdown.wav'); // Укажите путь к вашему звуковому файлу
        audio.play();
    }

    // Функция для обновления баланса и отображения монет
    function updateBalance() {
        coinCountElement.textContent = coinBalance;
    }

    // Функция для генерации падающих монет
    function generateCoins() {
        const gamePage = document.querySelector('.game-page');
        
        const coinInterval = setInterval(() => {
            const coin = document.createElement('div');
            coin.classList.add('coin');
            coin.style.left = Math.random() * 100 + 'vw'; // Случайная позиция по горизонтали
            gamePage.appendChild(coin);

            // Увеличиваем баланс при клике на монету
            coin.addEventListener('click', () => {
                const coinSound = new Audio('/sound/coin.wav'); // путь к звуку
                coinSound.play(); // Воспроизведение звука монеты
                coinBalance += 2; // Добавляем 2 к балансу
                updateBalance(); // Обновляем баланс на экране
                coin.remove(); // Удаляем монету после нажатия
            });

            // Удаляем монету, когда анимация закончится
            setTimeout(() => {
                coin.remove();
            }, 7000); // Медленное падение монет (7 секунд)

        }, 300); // Генерация новой монеты каждые 0.3 секунды (чаще)
        
        // Функция для остановки генерации монет
        return function stopCoins() {
            clearInterval(coinInterval);
        };
    }

    // Функция для отправки данных в базу по окончании игры
    async function saveBalanceToDatabase() {
        try {
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
                console.error('Ошибка при сохранении баланса');
            }
        } catch (error) {
            console.error('Ошибка:', error);
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
        
        const stopCoinGeneration = generateCoins(); // Запускаем генерацию монет

        const timerInterval = setInterval(() => {
            if (timerValue > 0) {
                timerValue--;
                let minutes = Math.floor(timerValue / 60);
                let seconds = timerValue % 60;
                timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            } else {
                clearInterval(timerInterval);
                showNotification('Time is up, the main menu will load in a couple of seconds!', true);

                // Останавливаем генерацию монет
                stopCoinGeneration(); 

                // Сохранить результат в базу данных
                saveBalanceToDatabase();

                // Перенаправление через 5 секунд
                setTimeout(() => {
                    window.location.href = `/index.html?userId=${telegramId}`;
                }, 5000); // 5000 миллисекунд = 5 секунд
            }
        }, 1000);
    }

    // Запуск отсчета при загрузке страницы
    window.onload = startCountdown;
});