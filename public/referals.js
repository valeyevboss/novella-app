document.addEventListener('DOMContentLoaded', () => {
    const inviteButton = document.querySelector('.invite-button');
    const inviteCopyButton = document.querySelector('.invite-copy-button');
    const refInfoBlock = document.querySelector('.ref-info-block');
    
    // Получаем ID текущего пользователя через сервер или другой способ
    const telegramId = '{{ user.telegramId }}'; // Например, передать через шаблон
    const uniqueReferralLink = `https://t.me/Novella_bot/app?startapp=onetime${telegramId}`;

    // Функция копирования ссылки в буфер обмена
    inviteCopyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(uniqueReferralLink)
            .then(() => {
                alert('Referral link copied to clipboard!');
            })
            .catch(err => {
                console.error('Failed to copy link: ', err);
            });
    });

    // Функция для открытия мессенджера с ссылкой
    inviteButton.addEventListener('click', () => {
        const shareData = {
            title: 'Invite to Novella App',
            text: 'Join Novella and get rewards!',
            url: uniqueReferralLink,
        };
        navigator.share(shareData)
            .then(() => console.log('Referral link shared successfully!'))
            .catch(err => console.error('Error sharing referral link: ', err));
    });

    // Показываем блок информации, если есть хотя бы один приглашённый
    fetch(`/api/get-invited-friends/${telegramId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.friends && data.friends.length > 0) {
                refInfoBlock.style.display = 'block';
            } else {
                refInfoBlock.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
});