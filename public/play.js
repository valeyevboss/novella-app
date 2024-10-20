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

            playButton.disabled = gameCount <= 0;
            playButton.classList.toggle('inactive', gameCount === 0);

            if (gameCount > 0) {
                playButton.addEventListener('click', async () => {
                    // Вызов API для уменьшения количества игр
                    const decrementResponse = await fetch(`/api/decrement-game-count/${userId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const decrementData = await decrementResponse.json();

                    if (decrementData.success) {
                        // Загрузка game.html с передачей userId
                        window.location.href = `/game.html?userId=${userId}`;
                    } else {
                        console.error('Ошибка уменьшения количества игр:', decrementData.message);
                        // Здесь можно добавить вывод сообщения пользователю
                    }
                });
            }
        } else {
            console.error('Ошибка получения количества игр:', data.message);
        }
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
});
