bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    // Проверяем, находится ли пользователь в банлисте
    if (await isUserBlocked(userId)) {
        bot.sendMessage(chatId, 'Your account has been banned. Please contact support. Visit: http://yourdomain.com/banned');
        return;
    }

    let user = await User.findOne({ telegramId: userId });
    if (!user) {
        const accountAge = Math.floor(Math.random() * 120); // Здесь должна быть логика для определения возраста аккаунта
        if (accountAge < 1) {
            await blockUser(userId, 'Account age is less than 1 month');
            bot.sendMessage(chatId, 'Your account is banned due to insufficient account age. Visit: http://yourdomain.com/banned');
            return;
        }
        user = new User({
            telegramId: userId,
            username: userName,
            lastLogin: new Date(),
            tokens: calculateTokens(accountAge) // начальное количество токенов
        });
        await user.save();
    } else {
        user.lastLogin = new Date();
        await user.save();
    }

    // Опции для клавиатуры
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Play Now',
                        url: 'https://your-web-app-url.com' // Замените на URL вашего веб-приложения
                    },
                    {
                        text: 'Join Novella Community',
                        url: 'https://t.me/novellatoken_community' // Замените на URL вашего телеграм-канала
                    }
                ]
            ]
        }
    };

    const imageUrl = 'https://i.imgur.com/zhgId3M.jpg'; // Публичный URL вашего изображения

    // Отправляем приветственное сообщение с кнопками и фото
    bot.sendPhoto(chatId, imageUrl, {
        caption: 'Welcome to the bot!',
        ...options
    }).catch(err => {
        console.error('Failed to send photo:', err);
    });
});
