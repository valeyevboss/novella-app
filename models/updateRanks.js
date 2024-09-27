const mongoose = require('mongoose');
const User = require('./models/User'); // Убедитесь, что путь правильный


async function updateUserRanks() {
    try {
        // Подключаемся к базе данных
        await mongoose.connect('mongodb+srv://nikitavaleyev:XpO3xtEjYuLgSbFX@novellaapp.0pp0y.mongodb.net/?retryWrites=true&w=majority&appName=novellaapp', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Обновляем всех пользователей, добавляя поле rank
        const result = await User.updateMany({}, { $set: { rank: 0 } }); // Здесь 0 — значение по умолчанию

        console.log(`Обновлено пользователей: ${result.modifiedCount}`);
    } catch (error) {
        console.error('Ошибка при обновлении пользователей:', error);
    } finally {
        // Закрываем соединение
        mongoose.connection.close();
    }
}

// Запускаем функцию
updateUserRanks();
