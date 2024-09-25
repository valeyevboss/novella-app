	const express = require('express');
	const path = require('path');
	const mongoose = require('mongoose');
	const TelegramBot = require('node-telegram-bot-api');
	const User = require('../models/User');
	const BannedIP = require('../models/BannedIP');

	const app = express();
	const port = process.env.PORT || 3000;

	const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
	if (!telegramBotToken) {
		console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables.');
		process.exit(1);
	}

	const bot = new TelegramBot(telegramBotToken, { polling: true });

	const bodyParser = require('body-parser');

	app.use(bodyParser.json()); // для обновления токенов и данных

	// Подключение папки для статических файлов
	app.use(express.static(path.join(__dirname, '..', 'public')));

	// Отдача index.html по умолчанию
	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
	});

	// Отдача loading.html и loadingerror.html по запросу
	app.get('/loading', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'loading.html'));
	});

	app.get('/loadingerror', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'loadingerror.html'));
	});

	// Отдача banned.html по запросу
	app.get('/banned', (req, res) => {
		res.sendFile(path.join(__dirname, '..', 'public', 'banned.html'));
	});

	// Подключение к MongoDB с ожиданием
	async function startServer() {
		try {
			await mongoose.connect(process.env.MONGO_URI, {
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

	// Проверка статуса пользователя и наличия username по telegramId
	app.get('/check-user/:telegramId', async (req, res) => {
		try {
			const { telegramId } = req.params;
			const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress; // Получаем IP-адрес
			const user = await User.findOne({ telegramId }); // Здесь telegramId

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}
			
			// Обновляем IP-адрес
			user.ip = userIp.split(', ')[0]; // Берем первый IP-адрес
			await user.save(); // Сохраняем изменения

			if (user.status === 'banned') {
				return res.json({ redirect: '/banned' });
			}

			if (!user.username) {
				return res.json({ redirect: '/loadingerror' });
			}

			return res.json({ tokens: user.tokens, redirect: '/' });
		} catch (error) {
			console.error('Ошибка проверки пользователя:', error);
			res.status(500).json({ error: 'Внутренняя ошибка сервера' });
		}
	});

	// Получение общего количества пользователей
	app.get('/total-users', async (req, res) => {
		try {
			const userCount = await User.countDocuments(); // Получаем общее количество документов в коллекции User
			res.json({ totalUsers: userCount });
		} catch (error) {
			console.error('Ошибка при получении количества пользователей:', error);
			res.status(500).json({ error: 'Внутренняя ошибка сервера' });
		}
	});


	// Проверка и начисление токенов пользователю
	app.post('/add-tokens/:telegramId', async (req, res) => {
		try {
			const { telegramId } = req.params;
			const { amount } = req.body;

			// Проверка корректности введенной суммы
			if (typeof amount !== 'number' || amount <= 0) {
				return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
			}

			const user = await User.findOne({ telegramId });

			if (!user) {
				return res.status(404).json({ error: 'User not found' });
			}

			// Обновляем баланс токенов
			user.tokens += amount;
			await user.save();

			res.json({ success: true, tokens: user.tokens });
		} catch (error) {
			console.error('Ошибка при добавлении токенов:', error);
			res.status(500).json({ error: 'Ошибка сервера' });
		}
	});

	// Объявляем URL изображения
	const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

	// Обработчик команды /start
	bot.onText(/\/start/, async (msg) => {
		const chatId = msg.chat.id;
		const telegramId = msg.from.id; // Телеграм ID пользователя
		const userName = msg.from.username || '';
	
		try {
			// Ищем пользователя по Telegram ID
			let user = await User.findOne({ telegramId });

			if (!user) {
				try {				
					// Создаем нового пользователя
					user = new User({
						telegramId: telegramId,
						username: userName,
						lastLogin: new Date(),
						tokens: 0
					});
					await user.save();
				} catch (err) {
					if (err.code === 11000) {
						console.error('User already exists with this telegramId');
					} else {
						console.error('Error saving user:', err);
					}
					return;
				}
			} else {
				// Обновляем последний вход
				user.lastLogin = new Date();
				if (userName) {
					user.username = userName;
				}
				await user.save();
			}

			// Проверка статуса пользователя
			if (user.status === 'banned') {
				return bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
			}

			const webAppUrl = `https://novella-telegram-bot.onrender.com/loading?userId=${telegramId}`; // Здесь использован telegramId

			// Отправляем сообщение пользователю с кнопками
			const options = {
				reply_markup: {
					inline_keyboard: [[
						{ text: 'Play Now', web_app: { url: webAppUrl } },
						{ text: 'Join Novella Community', url: 'https://t.me/novellatoken_community' }
					]]
				}
			};

			bot.sendPhoto(chatId, imageUrl, {
				caption: `Welcome, ${user.username || 'Guest'}!`,
				reply_markup: options.reply_markup
			});
		} catch (err) {
			console.error('Error handling /start:', err);
			bot.sendMessage(chatId, 'An error occurred. Please try again later.');
		}
	});