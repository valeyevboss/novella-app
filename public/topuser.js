async function getTopUsers() {
    try {
        const response = await fetch('/api/top-users');
        if (!response.ok) {
            throw new Error('Сеть не отвечает');
        }
        const topUsers = await response.json();
        displayTopUsers(topUsers);
    } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
    }
}

async function updateRanks() {
    try {
        const users = await User.find().sort({ tokens: -1 });
        console.log('Пользователи для обновления рангов:', users);
        let updatedRanks = false;

        await Promise.all(users.map((user, index) => {
            console.log(`Обновляем пользователя: ${user.username}, текущий ранг: ${user.rank}, новый ранг: ${index + 1}`);
            if (user.rank !== index + 1) {
                user.rank = index + 1;
                updatedRanks = true;
                return user.save();
            }
            return Promise.resolve();
        }));

        if (updatedRanks) {
            console.log('Ранги обновлены в базе данных');
        } else {
            console.log('Ранги не изменились');
        }
    } catch (error) {
        console.error('Ошибка при обновлении рангов:', error);
    }
}

async function refreshTopUsers() {
    await updateRanks(); // Обновление рангов
    await getTopUsers(); // Получение обновленного списка пользователей
}

function formatTokenBalance(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function displayTopUsers(users) {
    const leaderboardContainer = document.querySelector('.top100-container');
    leaderboardContainer.innerHTML = '';

    users.forEach((user, index) => {
        const userBlock = document.createElement('div');
        userBlock.classList.add('top100-user-info-block');

        const avatarUrl = user.avatarUrl ? user.avatarUrl : 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1727453958/default-avatar.png';

        let rankIcon = '';
        if (index === 0) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727726249/Pin/Gold-pin.png" alt="Top 1" class="rank-icon">';
        } else if (index === 1) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727725289/Pin/Silver-pin.png" alt="Top 2" class="rank-icon">';
        } else if (index === 2) {
            rankIcon = '<img src="https://res.cloudinary.com/dvjohgg6j/image/upload/v1727725289/Pin/Bronze-pin.png" alt="Top 3" class="rank-icon">';
        }

        userBlock.innerHTML = `
            <img src="${avatarUrl}" alt="User Avatar" class="top100-user-avatar">
            <div class="top100-user-details">
                <span class="top100-username">${user.username}</span>
                <span class="top100-token-balance">${formatTokenBalance(user.tokens)} $Novella</span>
            </div>
            <span class="top100-user-rank">${rankIcon}${(index < 3) ? '' : ' #' + (index + 1)}</span>
        `;

        leaderboardContainer.appendChild(userBlock);
    });
}

// Вызовите refreshTopUsers() при загрузке страницы
window.onload = refreshTopUsers;