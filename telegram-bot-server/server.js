const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
if (!telegramBotToken) {
    console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
    process.exit(1);
}

const bot = new TelegramBot(telegramBotToken, { polling: true });

// Подключение папки для статических файлов
app.use(express.static(path.join(__dirname, '..', 'public')));

// Отдача index.html по умолчанию
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Подключение к MongoDB с ожиданием
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Запуск сервера только после успешного подключения к базе данных
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Останавливаем сервер при ошибке подключения
    }
}

startServer();

// Добавление серверного маршрута для получения токенов
app.get('/tokens', async (req, res) => {
    try {
        // Например, получаем telegramId из запроса (предположим, что вы передаете его через query параметры)
        const { telegramId } = req.query;

        if (!telegramId) {
            return res.status(400).json({ error: 'Telegram ID is required' });
        }

        // Ищем пользователя по его telegramId
        const user = await User.findOne({ telegramId: telegramId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ tokens: user.tokens });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения токенов' });
    }
});

// Опции для клавиатуры
const options = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: 'Play Now',
                    web_app: {
                        url: 'https://novella-telegram-bot.onrender.com/' // Замените на URL вашего веб-приложения
                    }
                },
                {
                    text: 'Join Novella Community',
                    url: 'https://t.me/novellatoken_community' // Замените на URL вашего телеграм-канала
                }
            ]
        ]
    }
};

const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    try {
        // Ищем пользователя в базе данных или создаем нового
        let user = await User.findOne({ telegramId: userId });
		if (!user) {
			user = new User({
				telegramId: userId,
				username: userName,
				lastLogin: new Date(),
				tokens: 0 // Здесь начальное значение только для новых пользователей
			});
			await user.save();
		} else {
			// Обновляем только lastLogin, не сбрасывая tokens
			user.lastLogin = new Date();
			await user.save(); // Обратите внимание, что токены не изменяются
		}


        // Отправляем одно сообщение с картинкой и кнопками
        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${userName}!`,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'An error has occurred. Please try again later.');
    }
});