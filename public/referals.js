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

    const response = await fetch('/activate-referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramId: userid, enteredRefCode: enteredCode })
    });

    const result = await response.json();

    if (response.ok) {
        alert('Referral code activated! +1000 tokens awarded');
        document.querySelector('.ref-activate.btn').textContent = 'Claim';
    } else {
        alert(result.message || 'Error activating referral code');
    }
});
