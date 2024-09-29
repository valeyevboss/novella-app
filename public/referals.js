document.addEventListener('DOMContentLoaded', () => {
    const inviteButton = document.querySelector('.invite-button');
    const inviteCopyButton = document.querySelector('.invite-copy-button');
    const refInfoBlock = document.querySelector('.ref-info-block');
    
    // Получаем Telegram ID пользователя
    const telegramId = window.Telegram.WebApp.initDataUnsafe.user.id;
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
        if (navigator.share) {
            navigator.share(shareData)
                .then(() => console.log('Referral link shared successfully!'))
                .catch(err => console.error('Error sharing referral link: ', err));
        } else {
            alert('Sharing is not supported on this device.');
        }
    });

    // Показываем блок информации, если есть хотя бы один приглашённый
    fetch(`/api/get-invited-friends/${telegramId}`)
        .then(response => response.json())
        .then(data => {
            if (data.friends.length > 0) {
                refInfoBlock.style.display = 'block';
            } else {
                refInfoBlock.style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching friends:', error);
        });
});