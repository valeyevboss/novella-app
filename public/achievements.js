document.addEventListener("DOMContentLoaded", function() {
    // Получаем идентификатор пользователя из URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    // Проверяем, если есть пользовательский ID
    if (userId) {
        // Делаем запрос к серверу для получения информации о пользователе
        fetch(`/api/user-days/${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Обновляем количество дней в интерфейсе
                    const daysInGame = Math.floor(data.daysInGame);
                    document.getElementById("daily-count").innerText = daysInGame;
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                console.error('Ошибка при получении дней в игре:', error);
            });
    } else {
        console.error('User ID not found');
    }
});
