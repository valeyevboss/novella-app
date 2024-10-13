document.addEventListener("DOMContentLoaded", function() {
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    // Получаем реферальный код на основе userId
    async function fetchReferralCode() {
        try {
            const response = await fetch(`/referral-code/${userId}`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('ref-сode-count').textContent = data.refCode;
            } else {
                console.error('Ошибка загрузки реферального кода:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при получении реферального кода:', error);
        }
    }

    fetchReferralCode();

    // Проверяем, активирован ли код
    const isActivated = localStorage.getItem(`referralActivated_${userId}`);
    if (isActivated === 'true') {
        document.querySelector('.ref-activate-container').style.display = 'none';
    }

    // Обработчик клика для кнопки приглашения
    document.getElementById('invite-button').addEventListener('click', function() {
        const refCode = document.getElementById('ref-сode-count').textContent;
        const message = `Log in to the Novella App, activate the code: ${refCode}. Don't miss the chance to get $1000 Novella tokens for free! https://t.me/novella_bot?start=startapp`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, '_blank');
    });

    // Обработчик клика для кнопки копирования реферального кода
    document.querySelector('.invite-copy-button').addEventListener('click', function() {
        const refCode = document.getElementById('ref-сode-count').textContent;
        navigator.clipboard.writeText(refCode).then(() => {
            alert('Referral code copied!');
        });
    });

    // Обработчик клика для активации реферального кода
    document.querySelector('.ref-activate.btn').addEventListener('click', async function() {
        const enteredCode = document.querySelector('.ref-activate__field').value;

        if (!enteredCode) {
            alert('Please enter a referral code');
            return;
        }

        // Отправка запроса на активацию кода
        const response = await fetch('/activate-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userId, enteredRefCode: enteredCode })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Referral code activated! +1000 tokens awarded to you and +500 to the referrer.');
            document.querySelector('.ref-activate.btn').textContent = 'Claim'; // Меняем текст на Claim
            document.querySelector('.ref-activate.btn').setAttribute('data-activated', 'true'); // Добавляем атрибут для отслеживания активации
            
            // Скрываем блок активации реферального кода
            document.querySelector('.ref-activate-container').style.display = 'none';
            localStorage.setItem(`referralActivated_${userId}`, 'true'); // Сохраняем состояние активации в localStorage
        } else {
            alert(result.message || 'Error activating referral code');
        }
    });

    // Обработчик клика для получения токенов
    document.querySelector('.ref-activate.btn').addEventListener('click', async function() {
        if (this.getAttribute('data-activated') === 'true') { // Проверяем, активирован ли код
            const response = await fetch('/claim-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId: userId })
            });

            const result = await response.json();

            if (response.ok) {
                alert('Tokens claimed! +1000 tokens awarded.');
                this.textContent = 'Claimed'; // Меняем текст кнопки на Claimed
                this.setAttribute('data-activated', 'false'); // Сбрасываем атрибут
            } else {
                alert(result.message || 'Error claiming tokens');
            }
        } else {
            alert('You need to activate the referral code first.');
        }
    });
});