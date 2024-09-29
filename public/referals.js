document.addEventListener("DOMContentLoaded", function() {
    const inviteButton = document.querySelector('.invite-button');
    const inviteCopyButton = document.querySelector('.invite-copy-button');
    const refInfoBlock = document.querySelector('.ref-info-block');
    const friendsCountElem = document.querySelector('.friends-count');

    // Проверка наличия необходимых элементов
    if (!inviteButton || !inviteCopyButton || !refInfoBlock || !friendsCountElem) {
        console.error('One or more required elements not found.');
        return;
    }

    // Извлекаем telegramId из URL
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId'); // Предполагаем, что параметр называется userId

    if (!telegramId) {
        console.error('Telegram ID не найден в URL');
        return;
    }

    const referralLink = `https://t.me/Novella_bot/app?startapp=onetime&userId=${telegramId}`;
    let friendsCount = 0;

    // Функция для обновления информации о друзьях
    function updateFriendsCount() {
        friendsCountElem.textContent = `${friendsCount} friends`;
        if (friendsCount > 0) {
            refInfoBlock.style.display = 'block'; // Показываем блок информации о рефералах
        } else {
            refInfoBlock.style.display = 'none'; // Скрываем блок, если друзей нет
        }
    }

    // Обработчик нажатия на кнопку приглашения друзей
    inviteButton.addEventListener('click', function() {
        // Открываем диалоговое окно для выбора мессенджера
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`, '_blank');
    });

    // Обработчик нажатия на кнопку копирования ссылки
    inviteCopyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(referralLink)
            .then(() => {
                alert('Referral link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
            });
    });

    // Пример функции для добавления друга (здесь должна быть ваша логика добавления)
    function addFriend() {
        friendsCount += 1;
        updateFriendsCount();
    }

    // Для тестирования, добавьте друга
    addFriend(); // Уберите это или измените по мере необходимости
});
