document.getElementById('save-country-btn').addEventListener('click', async () => {
    const selectedCountry = document.getElementById('country-select').value; // Получаем выбранную страну
    const telegramId = getTelegramId(); // Замените на способ получения Telegram ID пользователя

    try {
        const response = await fetch(`/update-country/${telegramId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ country: selectedCountry }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Страна обновлена на: ${result.country}`);
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Ошибка при обновлении страны:', error);
        alert('Произошла ошибка при обновлении страны. Пожалуйста, попробуйте еще раз.');
    }
});