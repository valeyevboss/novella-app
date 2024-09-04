require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(telegramBotToken, { polling: true });

// Подключение папки для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Настройка и запуск Telegram бота
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Опции для клавиатуры
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Play Now',
                        url: 'https://novella-telegram-bot.onrender.com' // Замените на URL вашего веб-приложения
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

    bot.sendPhoto(chatId, imageUrl, {
        caption: 'Welcome to the bot!',
        ...options
    }).catch(err => {
        console.error('Failed to send photo:', err);
    });
});
