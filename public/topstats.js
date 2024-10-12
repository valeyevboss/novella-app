// Получаем userId из параметров URL
const params = new URLSearchParams(window.location.search);
const telegramId = params.get('userId'); // Получаем userId из параметров URL

document.getElementById('invite-copy-button').addEventListener('click', function() {
    const referralLink = `https://t.me/Novella_bot?start=${telegramId}`;
    navigator.clipboard.writeText(referralLink).then(() => {
        alert('Реферальная ссылка скопирована!');
    });
});

document.getElementById('invite-button').addEventListener('click', function() {
    const referralLink = `https://t.me/Novella_bot?start=${telegramId}`;
    
    const message = `Привет! Приглашаю тебя присоединиться к приложению! Вот моя реферальная ссылка: ${referralLink}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(message)}`;
    
    window.open(url, '_blank');
});

async function fetchFriendsCount() {
    const response = await fetch(`/api/get-friends-count/${telegramId}`);
    const data = await response.json();
    
    if (data.success) {
        document.getElementById('friends-count').textContent = `${data.friendsCount} friends`;
        
        if (data.friendsCount > 0) {
            document.querySelector('.ref-info-block').style.display = 'block'; // Показываем блок
        }
    }
}

// Вызов функции при загрузке страницы
fetchFriendsCount();