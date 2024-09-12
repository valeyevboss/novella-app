const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Task = require('../models/Task');

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
app.get('/tokens/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });
        if (user) {
            res.json({ tokens: user.tokens });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Ошибка получения токенов' });
    }
});

// Маршрут для зачисления токенов
app.post('/tasks/claim/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { telegramId } = req.body;

    try {
        // Найти пользователя по telegramId
        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Проверка, что задание выполнено (вам нужно добавить поле status для задач в модели)
        // Пример кода для проверки (если у вас есть поле status у задачи):
        // const task = await Task.findById(taskId);
        // if (!task || task.status !== 'completed') {
        //     return res.status(400).json({ error: 'Task not completed' });
        // }

        // Начисление токенов (замените rewardTokens на фактическое количество токенов из задания)
        const rewardTokens = 500; // Примерное количество токенов
        user.tokens += rewardTokens;
        await user.save();

        // Возвращаем информацию о начисленных токенах
        res.json({ tokens: rewardTokens });
    } catch (error) {
        console.error('Error claiming task:', error);
        res.status(500).json({ error: 'Ошибка зачисления токенов' });
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
                        url: `https://novella-telegram-bot.onrender.com/?telegramId=` // Добавим telegramId при отправке сообщения
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
                tokens: 0
            });
            await user.save();
        } else {
            user.lastLogin = new Date();
            await user.save();
        }

        // Формируем URL для веб-приложения с telegramId
        const webAppUrl = `https://novella-telegram-bot.onrender.com/?telegramId=${userId}`;

        // Отправляем сообщение с картинкой и кнопками
        bot.sendPhoto(chatId, imageUrl, {
            caption: `Welcome, ${userName}!`,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'Play Now',
                            web_app: { url: webAppUrl }
                        },
                        {
                            text: 'Join Novella Community',
                            url: 'https://t.me/novellatoken_community'
                        }
                    ]
                ]
            }
        });
    } catch (err) {
        console.error('Error handling /start:', err);
        bot.sendMessage(chatId, 'An error occurred. Please try again later.');
    }
});
