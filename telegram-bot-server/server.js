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
app.get('/', async (req, res) => {
    const telegramId = req.query.telegramId; // Получаем telegramId через URL

    if (!telegramId) {
        // Перенаправляем на страницу ошибки, если telegramId отсутствует
        return res.redirect('/loadingerror.html');
    }

    try {
        const user = await User.findOne({ telegramId });
        if (!user) {
            // Перенаправляем на страницу ошибки, если пользователь не найден в базе данных
            return res.redirect('/loadingerror.html');
        }

        // Если всё в порядке, отдаём index.html
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
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
        const user = await User.findOne({ username: 'valeyevboss' });
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
                        url: 'https://novella-telegram-bot.onrender.com/'
                    }
                },
                {
                    text: 'Join Novella Community',
                    url: 'https://t.me/novellatoken_community'
                }
            ]
        ]
    }
};

const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg';

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;

    try {
        if (!userId) {
            // Если у пользователя нет Telegram ID
            bot.sendMessage(chatId, 'У вас отсутствует Telegram ID. Пожалуйста, попробуйте позже.');
            return;
        }

        // Ищем пользователя в базе данных или создаем нового
        let user = await User.findOne({ telegramId: userId });
        if (!user) {
            user = new User({
                telegramId: userId,
                username: userName,
                lastLogin: new Date(),
                tokens: 0
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        // Отправляем сообщение с картинкой и кнопками
        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${userName}!`,
            reply_markup: options.reply_markup
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});