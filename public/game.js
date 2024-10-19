document.addEventListener('DOMContentLoaded', async () => {
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId'); // Теперь мы используем userId
    const playButton = document.getElementById('play-button');
    const gameCountElement = document.getElementById('game-count');

    try {
        // Используем userId для запроса
        const response = await fetch(`/api/user-games/${userId}`);
        const data = await response.json();

        if (data.success) {
            const gameCount = data.gameCount;
            gameCountElement.textContent = gameCount;

            // Проверка на количество игр и активация кнопки
            playButton.disabled = gameCount <= 0;
            playButton.classList.toggle('inactive', gameCount === 0);
        } else {
            console.error('Ошибка получения количества игр:', data.message);
            // Здесь можно добавить вывод сообщения пользователю
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
        // Здесь можно добавить вывод сообщения пользователю
    }
});