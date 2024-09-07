require('dotenv').config({ path: path.join(__dirname, '../telegram-bot-server/.env') }); // Проверка env и базы данных

// Проверка статуса пользователя
app.get('/check-status', async (req, res) => {
    const telegramId = req.query.telegramId;
    try {
        const user = await User.findOne({ telegramId: telegramId });
        if (user) {
            res.json({ status: user.status });
        } else {
            res.json({ status: 'No user found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Если пользователь забанен, перенаправляем его на banned.html
app.get('/banned', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
});

