require('dotenv').config({ path: path.join(__dirname, '../telegram-bot-server/.env') }); // Проверка env и базы данных

// Проверка статуса пользователя
app.get('/check-status', async (req, res) => {
    const telegramId = req.query.telegramId; // Получаем telegramId из запроса

    try {
        const user = await User.findOne({ telegramId: telegramId });

        if (user) {
            res.json({ status: user.status }); // Возвращаем статус пользователя
        } else {
            res.json({ status: 'No user found' }); // Если пользователь не найден
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' }); // Обработка ошибок
    }
});

// Маршрут для страницы бана
app.get('/banned', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
});
