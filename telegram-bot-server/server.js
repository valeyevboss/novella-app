const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User'); // Импортируем модель User

const app = express();
const port = process.env.PORT || 3000;

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(telegramBotToken, { polling: true });

	// Подключение папки для статических файлов
	app.use(express.static(path.join(__dirname, '..', 'public')));

	// Отдача index.html по умолчанию
	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
	});

	// Маршрут для страницы блокировки
	app.get('/banned', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
	});

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
	}};

    // Отправка сообщения пользователю
    bot.sendMessage(chatId, `Username: ${userName}, congratulations!`);
    bot.sendPhoto(chatId, 'https://yourdomain.com/telegram.png');
    bot.sendMessage(chatId, `Account age: ${Math.floor(Math.random() * 120)} months\nTokens awarded: ${user.tokens}`);
});
