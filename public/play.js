document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const playButton = document.getElementById('play-button');
    const gameCountElement = document.getElementById('game-count');

    try {
        const response = await fetch(`/api/user-games/${userId}`);
        const data = await response.json();

        if (data.success) {
            const gameCount = data.gameCount;
            gameCountElement.textContent = gameCount;

            // Проверка на количество игр и активация кнопки
            playButton.disabled = gameCount <= 0;
            playButton.classList.toggle('inactive', gameCount === 0);

            // Добавление обработчика события на кнопку
            if (gameCount > 0) {
                playButton.addEventListener('click', () => {
                    // Загрузка game.html с передачей userId
                    window.location.href = `/game.html?userId=${userId}`;
                });
            }
        } else {
            console.error('Ошибка получения количества игр:', data.message);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
});