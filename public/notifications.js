function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const messageElement = document.getElementById('notification-message');
    
    // Заполнение текстом и показ уведомления
    messageElement.textContent = message;
    notification.classList.remove('hidden', 'error', 'swipe');

    if (isError) {
        notification.classList.add('error');
    }

    notification.classList.add('show');

    // Уведомление исчезает через 5 секунд, если не было свайпа
    const timeout = setTimeout(() => {
        notification.classList.remove('show');
        notification.style.display = 'none';
    }, 5000);

    // Логика для свайпа закрытия
    let startX;

    // Начало свайпа
    notification.addEventListener('touchstart', (event) => {
        startX = event.touches[0].clientX;
    });

    // Конец свайпа
    notification.addEventListener('touchend', (event) => {
        const endX = event.changedTouches[0].clientX;
        if (startX - endX > 50) {
            notification.classList.add('swipe');
            clearTimeout(timeout); // Очищаем таймер автозакрытия
            setTimeout(() => {
                notification.classList.remove('show');
                notification.style.display = 'none';
            }, 300); // Время анимации свайпа
        }
    });

    // Закрытие по кнопке (если будет крестик для закрытия)
    document.querySelector('.close-btn').addEventListener('click', () => {
        notification.classList.add('swipe');
        clearTimeout(timeout);
        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.display = 'none';
        }, 300);
    });
}