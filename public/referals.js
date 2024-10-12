document.addEventListener("DOMContentLoaded", function() {
    const inviteButton = document.querySelector('.invite-button');
    const inviteCopyButton = document.querySelector('.invite-copy-button');
    const refInfoBlock = document.querySelector('.ref-info-block');
    const friendsCountElem = document.querySelector('.friends-count');

    // Извлечение telegramId из URL
    const params = new URLSearchParams(window.location.search);
    const telegramId = params.get('userId'); // Получаем telegramId из параметров URL

    // Проверка наличия необходимых элементов
    if (!inviteButton || !inviteCopyButton || !refInfoBlock || !friendsCountElem) {
        console.error('One or more required elements not found.');
        return;
    }

    // Проверка на наличие telegramId
    if (!telegramId) {
        console.error('telegramId не найден в URL');
        return;
    }

    const referralLink = `https://t.me/Novella_bot?start=${telegramId}`;
    let friendsCount = 0;

    // Функция для обновления информации о друзьях
    function updateFriendsCount(username) {
        friendsCount += 1; // Увеличиваем количество друзей
        friendsCountElem.textContent = `${friendsCount} friends`;
        
        // Обновление блока информации о рефералах
        const refFriendDiv = document.createElement('div');
        refFriendDiv.className = 'ref-friend';

        const avatar = document.createElement('img');
        avatar.src = "https://res.cloudinary.com/dvjohgg6j/image/upload/v1727453958/default-avatar.png"; // Путь к аватару
        avatar.alt = "User Avatar";
        avatar.className = 'ref-user-avatar';

        const userDetailsDiv = document.createElement('div');
        userDetailsDiv.className = 'ref-user-details';

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'ref-username';
        usernameSpan.textContent = username; // Имя пользователя

        userDetailsDiv.appendChild(usernameSpan);
        refFriendDiv.appendChild(avatar);
        refFriendDiv.appendChild(userDetailsDiv);

        const tokenDetailsDiv = document.createElement('div');
        tokenDetailsDiv.className = 'ref-token-details';

        const tokenBonusSpan = document.createElement('span');
        tokenBonusSpan.className = 'ref-token-bonus';
        tokenBonusSpan.textContent = '+100'; // Количество токенов

        const tokenIcon = document.createElement('img');
        tokenIcon.src = "https://res.cloudinary.com/dvjohgg6j/image/upload/v1725622251/novellacoin.png"; // Путь к иконке токена
        tokenIcon.alt = "Token Icon";
        tokenIcon.className = 'ref-token-icon';

        tokenDetailsDiv.appendChild(tokenBonusSpan);
        tokenDetailsDiv.appendChild(tokenIcon);
        refFriendDiv.appendChild(tokenDetailsDiv);

        refInfoBlock.appendChild(refFriendDiv); // Добавляем информацию о друге в блок
        refInfoBlock.style.display = 'block'; // Показываем блок, если есть друзья
    }

    // Обработчик нажатия на кнопку приглашения друзей
    inviteButton.addEventListener('click', function() {
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

    // Функция для обработки реферальной информации
    async function processReferral() {
        const referrerId = localStorage.getItem('referrerId'); // Получаем ID пригласившего пользователя из localStorage

        if (referrerId) {
            try {
                const response = await fetch(`/referral/${telegramId}`, { // Используем telegramId
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ referrerId })
                });

                if (response.ok) {
                    const data = await response.json();
                    updateFriendsCount(data.username); // Добавляем имя пользователя
                } else {
                    const errorData = await response.json();
                    console.error('Ошибка:', errorData.message);
                }
            } catch (error) {
                console.error('Ошибка при обработке реферальной ссылки:', error);
            }
        }
    }

    // Вызов функции для обработки рефералов при загрузке страницы
    processReferral();
});