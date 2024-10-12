document.addEventListener("DOMContentLoaded", function() {
    const inviteButton = document.querySelector('.invite-button');
    const inviteCopyButton = document.querySelector('.invite-copy-button');
    const refInfoBlock = document.querySelector('.ref-info-block');
    const friendsCountElem = document.querySelector('.friends-count');

    // Извлечение userId из URL
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId'); // Получаем userId из параметров URL

    // Проверка наличия необходимых элементов
    if (!inviteButton || !inviteCopyButton || !refInfoBlock || !friendsCountElem) {
        console.error('One or more required elements not found.');
        return;
    }

    // Проверка на наличие userId
    if (!userId) {
        console.error('userId не найден в URL');
        return;
    }

    const referralLink = `https://t.me/novella_bot/app?startapp=onetime&userId=${userId}`;
    let friendsCount = 0;

    // Функция для обновления информации о друзьях
    function updateFriendsCount() {
        friendsCountElem.textContent = `${friendsCount} friends`;
        refInfoBlock.style.display = friendsCount > 0 ? 'block' : 'none'; // Показываем или скрываем блок информации о рефералах
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
                const response = await fetch(`/referral/${userId}`, { // Используем userId
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ referrerId })
                });

                if (response.ok) {
                    const data = await response.json();
                    friendsCount += 1; // Увеличиваем количество друзей
                    updateFriendsCount(); // Обновляем отображение
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