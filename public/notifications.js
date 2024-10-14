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

    // Воспроизведение звука уведомления
    const audio = new Audio('sound/Succes-Notifications.wav');
    audio.play().catch(error => {
        console.error('Ошибка при воспроизведении звука:', error);
    });

    // Начальное положение уведомления за пределами экрана
    notification.style.top = '-100px'; // Начальная позиция за пределами экрана
    setTimeout(() => {
        notification.style.top = '20px'; // Позиция в видимой части экрана
    }, 50); // Небольшая задержка, чтобы задать новую позицию после отображения

    // Уведомление исчезает через 5 секунд, если не было свайпа
    const timeout = setTimeout(() => {
        hideNotification(notification);
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
            clearTimeout(timeout); // Очищаем таймер автозакрытия
            hideNotification(notification);
        }
    });
}

// Функция для скрытия уведомления
function hideNotification(notification) {
    notification.classList.add('swipe'); // Добавляем класс для анимации закрытия

    // Анимация и скрытие уведомления
    setTimeout(() => {
        notification.classList.remove('show'); // Убираем класс show
        notification.style.display = 'none'; // Убираем уведомление
        notification.style.top = '-100px'; // Возвращаем уведомление за пределы экрана
        notification.classList.add('hidden'); // Добавляем класс hidden для скрытия
    }, 300); // Время анимации закрытия
}