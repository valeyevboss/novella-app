document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramId = urlParams.get('userId');
    let coinBalance = 0; // Начальный баланс для игры
    let countdownValue = 5;
    const countdownElement = document.getElementById('countdown');
    const letsGoElement = document.getElementById('lets-go');
    const coinCountElement = document.getElementById('coinCount');

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
                const coinSound = new Audio('/sound/coin.wav');
                coinSound.play();
                coinBalance += 2;
                updateBalance();
                coin.remove();
            });

            setTimeout(() => {
                coin.remove();
            }, 10000); // Падение монет в течение 10 секунд

        }, 500); // Генерация монет каждые 0.5 секунд

        return function stopCoins() {
            clearInterval(coinInterval);
        };
    }

    // Функция для генерации мин
    function generateMines() {
        const gamePage = document.querySelector('.game-page');

        const mineInterval = setInterval(() => {
            const mine = document.createElement('div');
            mine.classList.add('mine');
            mine.style.left = Math.random() * 100 + 'vw'; // Случайная позиция по горизонтали
            gamePage.appendChild(mine);

            // Обнуляем баланс при клике на мину
            mine.addEventListener('click', () => {
                const mineSound = new Audio('/sound/mine.wav');
                mineSound.play();
                coinBalance = 0; // Обнуляем баланс
                updateBalance();
                mine.remove();
            });

            setTimeout(() => {
                mine.remove();
            }, 10000); // Падение мин в течение 10 секунд

        }, 5000); // Генерация мин каждые 5 секунд (реже монет)

        return function stopMines() {
            clearInterval(mineInterval);
        };
    }

    // Функция для запуска основной игры
    function startGame() {
        const hud = document.querySelector('.hud-game');
        hud.style.transform = 'translateY(-120%)';
        hud.style.opacity = '1';
        hud.style.transition = 'transform 1s ease-in-out, opacity 1s ease-in-out';

        setTimeout(() => {
            hud.style.transform = 'translateY(0)';
        }, 50);

        let timerValue = 30;
        const timerElement = document.getElementById('timer-game');

        const stopCoinGeneration = generateCoins(); // Запускаем генерацию монет
        const stopMineGeneration = generateMines(); // Запускаем генерацию мин

        const timerInterval = setInterval(() => {
            if (timerValue > 0) {
                timerValue--;
                let minutes = Math.floor(timerValue / 60);
                let seconds = timerValue % 60;
                timerElement.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
            } else {
                clearInterval(timerInterval);
                stopCoinGeneration(); 
                stopMineGeneration();

                saveBalanceToDatabase();

                setTimeout(() => {
                    window.location.href = `/index.html?userId=${telegramId}`;
                }, 5000);
            }
        }, 1000);
    }

    // Функция для отсчета перед стартом игры
    function startCountdown() {
        countdownElement.style.display = 'block'; // Показываем элемент отсчета
        const countdownInterval = setInterval(() => {
            if (countdownValue > 0) {
                countdownElement.textContent = countdownValue;
                countdownValue--;
            } else {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none'; // Скрываем элемент отсчета
                letsGoElement.style.display = 'block'; // Показываем текст "Let’s Go!"

                // Анимация "Let’s Go!"
                setTimeout(() => {
                    letsGoElement.style.display = 'none'; // Скрываем текст
                    startGame(); // Запускаем основную игру
                }, 1000); // Ждем 1 секунду перед началом игры
            }
        }, 1000);
    }

    // Запуск отсчета при загрузке страницы
    window.onload = startCountdown;
});
