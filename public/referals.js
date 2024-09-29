// Функция для генерации уникальной реферальной ссылки
function generateReferralLink(telegramId) {
    return `https://t.me/Novella_bot/app?startapp=onetime${telegramId}`;
}

// Копирование ссылки в буфер обмена
function copyReferralLink(link) {
    navigator.clipboard.writeText(link).then(() => {
        alert('Referral link copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Функция для приглашения друзей
function inviteFriends(link) {
    // Логика для отправки ссылки через Telegram или другое приложение
    window.open(`tg://msg?text=Join me on Novella App: ${link}`, '_blank');
}

// Получаем данные пользователя (например, из базы данных или через запрос)
fetch('/api/user-stats')
    .then(response => response.json())
    .then(user => {
        const telegramId = user.telegramId;
        const referralLink = generateReferralLink(telegramId);

        // Привязываем ссылку к кнопке "Invite Friends"
        const inviteButton = document.querySelector('.invite-button');
        inviteButton.addEventListener('click', () => inviteFriends(referralLink));

        // Привязываем копирование к кнопке "Copy"
        const copyButton = document.querySelector('.invite-copy-button');
        copyButton.addEventListener('click', () => copyReferralLink(referralLink));
    })
    .catch(error => console.error('Error fetching user data:', error));

// Получаем параметры URL (например, referrerId)
const urlParams = new URLSearchParams(window.location.search);
const referrerId = urlParams.get('startapp');

// Если есть параметр referrerId, отправляем его на сервер
if (referrerId) {
    fetch(`/referral/${referrerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referrerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Referral bonus added');
        } else {
            console.error(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}