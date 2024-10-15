let miningInProgress = false;
let miningDuration = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах
let startTime;

function startMining() {
  if (!miningInProgress) {
    miningInProgress = true;
    startTime = Date.now();
    
    document.getElementById('start-mining-btn').disabled = true; // Отключаем кнопку
    
    updateTimer();
    updateProgressBar();
  }
}

function updateTimer() {
  const timeLeft = miningDuration - (Date.now() - startTime);
  
  if (timeLeft > 0) {
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    document.getElementById('timer').textContent = `${hours}h ${minutes}m`;
    setTimeout(updateTimer, 1000 * 60); // Обновляем каждую минуту
  } else {
    completeMining();
  }
}

function updateProgressBar() {
  const elapsed = Date.now() - startTime;
  const progressPercent = (elapsed / miningDuration) * 100;
  
  // Получаем элемент .progress-bar и обновляем ширину псевдоэлемента
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.setProperty('--progress-width', `${progressPercent}%`);

  if (miningInProgress && progressPercent < 100) {
    requestAnimationFrame(updateProgressBar); // Плавное обновление заполнения
  }
}

function completeMining() {
  miningInProgress = false;
  document.getElementById('start-mining-btn').textContent = 'Claim 100 $Novella';
  document.getElementById('start-mining-btn').disabled = false; // Снова активируем кнопку
  
  document.getElementById('start-mining-btn').onclick = claimTokens; // Меняем функцию на получение токенов
}

function claimTokens() {
  // Логика начисления токенов на баланс
  fetch(`/add-tokens/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100 })
  }).then(response => response.json()).then(data => {
    if (data.success) {
      document.getElementById('start-mining-btn').textContent = 'Start Mining';
      document.getElementById('start-mining-btn').onclick = startMining;
    }
  });
}