const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const User = require('../models/User'); // Подключение модели пользователя

// Токен Telegram бота
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Найти пользователя по chatId
        const user = await User.findOne({ chatId: chatId });
        
        if (!user) {
            // Если пользователь не найден, создать нового
            const newUser = new User({ chatId: chatId });
            await newUser.save();
            bot.sendMessage(chatId, "Добро пожаловать в наше приложение!");
        } else {
            // Проверка статуса пользователя
            if (user.status === 'banned') {
                bot.sendMessage(chatId, "Ваш аккаунт заблокирован за нарушение правил использования приложения.");
            } else {
                bot.sendMessage(chatId, "Добро пожаловать обратно!");
            }
        }
    } catch (error) {
        console.error("Ошибка при обработке команды /start:", error);
    }
});

// Пример обработки другой команды
bot.onText(/\/anothercommand/, async (msg) => {
    const chatId = msg.chat.id;

    try {
        const user = await User.findOne({ chatId: chatId });
        
        if (user && user.status === 'banned') {
            bot.sendMessage(chatId, "Ваш аккаунт заблокирован. Вы не можете использовать эту команду.");
        } else {
            bot.sendMessage(chatId, "Команда успешно выполнена.");
        }
    } catch (error) {
        console.error("Ошибка при обработке команды:", error);
    }
});
