document.addEventListener("DOMContentLoaded", function() {
    const startMiningBtn = document.getElementById('start-mining-btn');
    const claimMiningBtn = document.getElementById('claim-mining-btn'); 
    const timerMiningDisplay = document.getElementById('timer-mining');
    
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId'); // Получаем userId из параметров URL
    const miningStartTimeKey = `miningStartTime_${userId}`; // Уникальный ключ для времени старта майнинга
    const rewardClaimedKey = `rewardClaimed_${userId}`; // Уникальный ключ для состояния награды

    // Функция для запуска майнинга (начало отсчета таймера)
    function startMining() {
        const miningStartTime = Date.now();
        localStorage.setItem(miningStartTimeKey, miningStartTime); // Сохраняем время начала майнинга
        localStorage.removeItem(rewardClaimedKey); // Убираем информацию о предыдущем получении награды

        startMiningBtn.disabled = true; // Блокируем кнопку Start Mining
        timerMiningDisplay.textContent = ''; // Сбрасываем таймер

        startTimer(10); // Запускаем таймер на 10 секунд (для теста)
    }

    // Функция для начала обратного отсчета
    function startTimer(duration) {
        let timer = duration;
        const countdownInterval = setInterval(() => {
            timerMiningDisplay.textContent = `Time left: ${timer}s`;
            if (--timer < 0) {
                clearInterval(countdownInterval);
                showClaimButton(); // Показываем кнопку Claim после завершения таймера
            }
        }, 1000);
    }

    // Функция для показа кнопки Claim и скрытия кнопки Start Mining
    function showClaimButton() {
        claimMiningBtn.style.display = 'block'; // Показываем кнопку Claim
        startMiningBtn.style.display = 'none'; // Скрываем кнопку Start Mining
    }

    // Функция для начисления награды (Claim)
    async function claimReward() {
        const response = await fetch(`/add-tokens/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 100 }) // Начисляем 100 токенов
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('You have received 100 tokens!', true); // Показываем уведомление

            // Сохраняем информацию о том, что награда была получена
            localStorage.setItem(rewardClaimedKey, 'true');

            claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim
            timerMiningDisplay.textContent = ''; // Сброс таймера

            // Возвращаем кнопку Start Mining в видимое состояние после перезагрузки
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            const errorData = await response.json();
            showNotification(`Error: ${errorData.error}`, false); // Показываем ошибку
        }
    }

    // Обработчики нажатий на кнопки
    startMiningBtn.addEventListener('click', startMining);
    claimMiningBtn.addEventListener('click', claimReward);

    // Проверка статуса майнинга и восстановления кнопок после перезагрузки страницы
    const savedMiningStartTime = localStorage.getItem(miningStartTimeKey);
    const rewardClaimed = localStorage.getItem(rewardClaimedKey);

    if (savedMiningStartTime && !rewardClaimed) {
        const timeElapsed = (Date.now() - savedMiningStartTime) / 1000;
        if (timeElapsed >= 10) {
            showClaimButton(); // Если прошло 10 секунд, показываем кнопку Claim
        } else {
            startTimer(10 - Math.floor(timeElapsed)); // Продолжаем отсчет
            startMiningBtn.disabled = true; // Блокируем кнопку Start Mining пока идет таймер
        }
    } else {
        // Если награда была получена, делаем кнопку Start Mining видимой
        startMiningBtn.disabled = false; // Возвращаем кнопку Start Mining в активное состояние
        startMiningBtn.style.display = 'block'; 
        claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim
    }
});