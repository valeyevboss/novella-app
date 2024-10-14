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

    // Функция для получения количества друзей
    async function fetchFriendsCount() {
        try {
            const response = await fetch(`/api/friends-count/${userId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    document.getElementById('friends-count').textContent = `${data.friendsCount} friends`;
                } else {
                    console.error('Ошибка получения друзей:', data.message);
                }
            } else {
                console.error('Ошибка загрузки количества друзей:', response.statusText);
            }
        } catch (error) {
            console.error('Ошибка при получении количества друзей:', error);
        }
    }

    fetchFriendsCount();

    // Проверяем, активирован ли код
    const isActivated = localStorage.getItem(`referralActivated_${userId}`);
    if (isActivated === 'true') {
        document.querySelector('.ref-activate-container').style.display = 'none';
    }

    // Обработчик клика для кнопки приглашения
    document.getElementById('invite-button').addEventListener('click', function() {
        const refCode = document.getElementById('ref-сode-count').textContent;
        const message = `Activate the code: ${refCode}. Don't miss the chance to get $1000 Novella tokens for free!\n👑 Join me in @novella_bot game and earn $Novella token soon!\n⭐️ $1000 Novella tokens bonus for you.\n⭐️ $500 Novella tokens bonus if your friend joins.`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, '_blank');
    });

    // Обработчик клика для кнопки копирования реферального кода
    document.querySelector('.invite-copy-button').addEventListener('click', function() {
        const refCode = document.getElementById('ref-сode-count').textContent;
        navigator.clipboard.writeText(refCode).then(() => {
            showNotification('Referral code copied!');
        });
    });

    // Обработчик клика для активации реферального кода
    document.querySelector('.ref-activate.btn').addEventListener('click', async function() {
        const enteredCode = document.querySelector('.ref-activate__field').value;

        if (!enteredCode) {
            showNotification('Please enter a referral code', true);
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
            showNotification('You got +1000 $Novella!');
            document.querySelector('.ref-activate.btn').textContent = 'Claim'; // Меняем текст на Claim
            document.querySelector('.ref-activate.btn').setAttribute('data-activated', 'true'); // Добавляем атрибут для отслеживания активации
            
            // Скрываем блок активации реферального кода
            document.querySelector('.ref-activate-container').style.display = 'none';
            localStorage.setItem(`referralActivated_${userId}`, 'true'); // Сохраняем состояние активации в localStorage
        } else {
            showNotification(result.message || 'Error activating referral code', true);
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
                showNotification('Tokens claimed! +1000 tokens awarded.');
                this.textContent = 'Claimed'; // Меняем текст кнопки на Claimed
                this.setAttribute('data-activated', 'false'); // Сбрасываем атрибут
            } else {
                showNotification(result.message || 'Error claiming tokens', true);
            }
        } else {
            showNotification('You need to activate the referral code first.', true);
        }
    });
});