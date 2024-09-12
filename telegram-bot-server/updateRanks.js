const User = require('../models/User');

async function updateRanks() {
    try {
        // Сначала сбрасываем ранги всех пользователей
        await User.updateMany({}, { $set: { rank: 0 } });

        // Получаем всех пользователей, отсортированных по токенам в порядке убывания
        const users = await User.find().sort({ tokens: -1 });

        // Обновляем ранги пользователей
        for (let i = 0; i < users.length; i++) {
            users[i].rank = i + 1;
            await users[i].save();
        }

        console.log('Ранги обновлены успешно.');
    } catch (error) {
        console.error('Ошибка обновления рангов:', error);
    }
}

module.exports = { updateRanks };
