document.addEventListener("DOMContentLoaded", function() {
    const startMiningBtn = document.getElementById('start-mining-btn');
    const claimMiningBtn = document.getElementById('claim-mining-btn'); 
    const timerMiningDisplay = document.getElementById('timer-mining');
    const miningText = document.getElementById('text-mining-click');
    
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const miningStartTimeKey = `miningStartTime_${userId}`;
    const rewardClaimedKey = `rewardClaimed_${userId}`;

    const totalMiningTime = 12 * 60 * 60; // 12 часов в секундах

    function startMining() {
        const miningStartTime = Date.now();
        localStorage.setItem(miningStartTimeKey, miningStartTime);
        localStorage.removeItem(rewardClaimedKey);
        
        startMiningBtn.textContent = 'Mining...';
        startMiningBtn.disabled = true;
        miningText.style.display = 'none';
        timerMiningDisplay.textContent = '';

        startTimer(totalMiningTime);
        showNotification('Mine up to 500 $Novella per day.', true);
    }

    function startTimer(duration) {
        const countdownInterval = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - parseInt(localStorage.getItem(miningStartTimeKey))) / 1000);
            const remainingTime = duration - elapsedTime;

            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);

            timerMiningDisplay.textContent = `${hours}H ${minutes}M`;
            const progress = ((duration - remainingTime) / duration) * 100;
            startMiningBtn.style.setProperty('--progress', `${progress}%`);

            if (remainingTime <= 0) {
                clearInterval(countdownInterval);
                showClaimButton();
            }
        }, 1000);
    }

    function showClaimButton() {
        claimMiningBtn.style.display = 'block';
        startMiningBtn.style.display = 'none';
        startMiningBtn.style.setProperty('--progress', '0');
    }    

    async function claimReward() {
        const response = await fetch(`/add-tokens/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: 250 }) 
        });

        if (response.ok) {
            const data = await response.json();
            showNotification('You have received 100 tokens!', true);
            localStorage.setItem(rewardClaimedKey, 'true');

            claimMiningBtn.style.display = 'none';
            timerMiningDisplay.textContent = '';
            miningText.style.display = 'none';

            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            const errorData = await response.json();
            showNotification(`Error: ${errorData.error}`, false);
        }
    }

    startMiningBtn.addEventListener('click', startMining);
    claimMiningBtn.addEventListener('click', claimReward);

    // Проверка статуса майнинга и восстановление состояния кнопок
    const savedMiningStartTime = localStorage.getItem(miningStartTimeKey);
    const rewardClaimed = localStorage.getItem(rewardClaimedKey);

    if (savedMiningStartTime) {
        const timeElapsed = (Date.now() - savedMiningStartTime) / 1000;
        if (rewardClaimed) {
            startMiningBtn.disabled = false;
            startMiningBtn.style.display = 'block';
            claimMiningBtn.style.display = 'none';
            miningText.style.display = 'block';
        } else {
            const remainingTime = totalMiningTime - timeElapsed;
            if (remainingTime <= 0) {
                showClaimButton();
                miningText.style.display = 'none';
            } else {
                startTimer(remainingTime); // Начать отсчет оставшегося времени
                startMiningBtn.disabled = true; 
                miningText.style.display = 'none';
            }
        }
    } else {
        startMiningBtn.disabled = false; 
        startMiningBtn.style.display = 'block'; 
        claimMiningBtn.style.display = 'none';
        miningText.style.display = 'block';
    }
});