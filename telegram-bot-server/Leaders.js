// Функция для получения количества пользователей и отображения в блоке
async function fetchUserCount() {
    try {
        const response = await fetch('/user-count');
        const data = await response.json();
        document.getElementById('user-count').textContent = data.count;
    } catch (error) {
        console.error('Ошибка получения количества пользователей:', error);
    }
}

// Функция для получения топ-100 пользователей
async function fetchTopUsers() {
    try {
        const response = await fetch('/top-users');
        const data = await response.json();
        const topUsersContainer = document.querySelector('.top-100');
        
        data.users.forEach(user => {
            const userBlock = document.createElement('div');
            userBlock.classList.add('top-user-block');
            
            userBlock.innerHTML = `
                <img src="${user.avatar}" alt="User Avatar" class="top-user-avatar">
                <div class="top-user-info">
                    <p class="top-user-name">${user.username}</p>
                    <p class="top-user-tokens">${user.tokens} NC</p>
                </div>
                <div class="top-user-rank"># ${user.rank}</div>
            `;
            
            topUsersContainer.appendChild(userBlock);
        });
    } catch (error) {
        console.error('Ошибка загрузки топ-100 пользователей:', error);
    }
}

// Загрузка данных при загрузке страницы
window.onload = function() {
    fetchUserCount();
    fetchTopUsers();
};
