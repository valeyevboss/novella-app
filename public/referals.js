document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

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

    document.getElementById('invite-button').addEventListener('click', function() {
        const refCode = document.getElementById('ref-сode-count').textContent;
        const message = `Log in to the Novella App, activate the code: ${refCode}. Don't miss the chance to get $1000 Novella tokens for free! https://t.me/novella_bot?start=startapp`;
        window.open(`https://t.me/share/url?url=${encodeURIComponent(message)}`, '_blank');
    });

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

        const response = await fetch('/activate-referral', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ telegramId: userId, enteredRefCode: enteredCode })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Referral code activated! Click Claim to receive your tokens.');
            document.querySelector('.ref-activate.btn').textContent = 'Claim';

            // Сохраним состояние, что код активирован
            document.querySelector('.ref-activate.btn').setAttribute('data-activated', 'true');
        } else {
            alert(result.message || 'Error activating referral code');
        }
    });

    // Обработчик клика для кнопки Claim
    document.querySelector('.ref-activate.btn').addEventListener('click', async function() {
        const isActivated = this.getAttribute('data-activated') === 'true';

        if (isActivated) {
            const response = await fetch('/claim-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ telegramId: userId }) // Отправляем telegramId для начисления токенов
            });

            const result = await response.json();

            if (response.ok) {
                alert('You have successfully claimed your tokens!');
                this.textContent = 'Claimed'; // Меняем текст кнопки после успешного начисления
                this.setAttribute('data-activated', 'false'); // Сбрасываем состояние
            } else {
                alert(result.message || 'Error claiming tokens');
            }
        }
    });
});