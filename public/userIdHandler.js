// Получаем telegramId из URL один раз
const urlParams = new URLSearchParams(window.location.search);
const telegramId = urlParams.get('userId');

// Обновляем ссылки в нижнем меню, если telegramId существует
if (telegramId) {
    const menuItems = document.querySelectorAll('.bottom-menu a');
    menuItems.forEach(item => {
        const originalHref = item.getAttribute('href');
        item.setAttribute('href', `${originalHref}?userId=${telegramId}`);
    });

    // Сохраняем telegramId в истории, чтобы при возврате оно не сбрасывалось
    history.replaceState(null, '', `${window.location.pathname}?userId=${telegramId}`);
}
