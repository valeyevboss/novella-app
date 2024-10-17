document.addEventListener("DOMContentLoaded", function() {
    const startMiningBtn = document.getElementById('start-mining-btn');
    const claimMiningBtn = document.getElementById('claim-mining-btn'); 
    const timerMiningDisplay = document.getElementById('timer-mining');
    const progressBar = document.getElementById('progress-bar');
    const miningText = document.getElementById('text-mining-click'); // Элемент текста Click Here
    
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId'); // Получаем userId из параметров URL
    const miningStartTimeKey = `miningStartTime_${userId}`; // Уникальный ключ для времени старта майнинга
    const rewardClaimedKey = `rewardClaimed_${userId}`; // Уникальный ключ для состояния награды

    // Общее время для таймера (12 часов в секундах)
    const totalMiningTime = 12 * 60 * 60; // 12 часов

    // Функция для запуска майнинга (начало отсчета таймера)
    function startMining() {
        const miningStartTime = Date.now();
        localStorage.setItem(miningStartTimeKey, miningStartTime); // Сохраняем время начала майнинга
        localStorage.removeItem(rewardClaimedKey); // Убираем информацию о предыдущем получении награды
    
        // Меняем текст на "Mining..."
        startMiningBtn.textContent = 'Mining...'; 
    
        startMiningBtn.disabled = true; // Блокируем кнопку Start Mining
        timerMiningDisplay.textContent = ''; // Сбрасываем таймер
        progressBar.style.width = '0'; // Сбрасываем ширину заливки
        miningText.style.display = 'none'; // Скрываем текст Click Here
    
        startTimer(totalMiningTime); // Запускаем таймер на 12 часов
    }

    // Функция для начала обратного отсчета
    function startTimer(duration) {
        const countdownInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - parseInt(localStorage.getItem(miningStartTimeKey))) / 1000);
            const remainingTime = duration - elapsedTime;
    
            // Обновляем часы и минуты
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
    
            // Обновляем текст таймера
            timerMiningDisplay.textContent = `${hours}H ${minutes}M`;
    
            // Вычисляем прогресс в процентах
            const progress = ((duration - remainingTime) / duration) * 100;
            
            // Обновляем ширину заливки кнопки
            document.getElementById('start-mining-btn').style.setProperty('--progress', `${progress}%`);
    
            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                showClaimButton(); // Показываем кнопку Claim после завершения таймера
            }
        }, 1000);
    }
    
    // Функция для показа кнопки Claim и скрытия кнопки Start Mining
    function showClaimButton() {
        claimMiningBtn.style.display = 'block'; // Показываем кнопку Claim
        startMiningBtn.style.display = 'none'; // Скрываем кнопку Start Mining
        startMiningBtn.style.setProperty('--progress', '0'); // Сбрасываем заливку
    }    

    // Функция для начисления награды (Claim)
    async function claimReward() {
        const response = await fetch(`/add-tokens/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 250 }) // Начисляем 100 токенов
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('You have received 100 tokens!', true); // Показываем уведомление

            // Сохраняем информацию о том, что награда была получена
            localStorage.setItem(rewardClaimedKey, 'true');

            claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim
            timerMiningDisplay.textContent = ''; // Сброс таймера
            miningText.style.display = 'none'; // Скрываем текст Click Here

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

    if (savedMiningStartTime) {
        const timeElapsed = (Date.now() - savedMiningStartTime) / 1000;
        if (rewardClaimed) {
            // Если награда была получена, делаем кнопку Start Mining видимой
            startMiningBtn.disabled = false; // Возвращаем кнопку Start Mining в активное состояние
            startMiningBtn.style.display = 'block'; 
            claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim
            miningText.style.display = 'block'; // Показываем текст Click Here
        } else {
            // Если награда не была получена, проверяем, прошел ли таймер
            const remainingTime = totalMiningTime - timeElapsed;
            if (remainingTime <= 0) {
                showClaimButton(); // Если таймер завершен, показываем кнопку Claim
                miningText.style.display = 'none'; // Скрываем текст Click Here
            } else {
                startTimer(totalMiningTime); // Продолжаем отсчет
                startMiningBtn.disabled = true; // Блокируем кнопку Start Mining пока идет таймер
                miningText.style.display = 'none'; // Скрываем текст Click Here
            }
        }
    } else {
        // Если награда не была получена и майнинг не начат
        startMiningBtn.disabled = false; // Возвращаем кнопку Start Mining в активное состояние
        startMiningBtn.style.display = 'block'; 
        claimMiningBtn.style.display = 'none'; // Скрываем кнопку Claim
        miningText.style.display = 'block'; // Показываем текст Click Here
    }
});