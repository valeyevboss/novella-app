bot.onText(/\/start (.+)/, async (msg, match) => {
    const telegramId = msg.from.id.toString();
    const referrerId = match[1];

    // Создаем нового пользователя
    let user = await User.findOne({ telegramId });

    if (!user) {
        user = new User({ telegramId, referrerId });
        await user.save();

        // Если есть реферер, добавляем токены
        if (referrerId) {
            const referrer = await User.findOne({ telegramId: referrerId });
            if (referrer) {
                referrer.tokens += 100; // Начисление токенов
                referrer.friendsCount += 1; // Увеличиваем счетчик друзей
                await referrer.save();
            }
        }

        bot.sendMessage(telegramId, "Добро пожаловать в приложение! Вы получили 100 токенов за приглашение!");
    } else {
        bot.sendMessage(telegramId, "Вы уже зарегистрированы!");
    }
});
