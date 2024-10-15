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

// Подключение папки locales как статических файлов
app.use('/locales', express.static(path.join(__dirname, '..', 'locales')));

// Отдача index.html по умолчанию
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Отдача index.html по явному пути
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Проверка на доступ через Telegram Web и браузеры
app.get('/loading', (req, res) => {
    const userAgent = req.headers['user-agent'];

    // Проверяем, если user-agent указывает на браузер (например, Telegram Web)
    const isTelegramWeb = userAgent.includes('TelegramBot') || userAgent.includes('WebApp');
    const isBrowser = !userAgent.includes('Telegram');

    if (isBrowser && !isTelegramWeb) {
        // Если это браузер, а не Telegram Web App — перенаправляем на блокированную страницу
        return res.sendFile(path.join(__dirname, '..', 'public', 'blockedweb.html'));
    }

    // Если это Telegram Web или мобильное приложение, продолжаем загрузку
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

		return res.json({ tokens: user.tokens, redirect: `/index.html?userId=${telegramId}` });
	} catch (error) {
		console.error('Ошибка проверки пользователя:', error);
		res.status(500).json({ error: 'Внутренняя ошибка сервера' });
	}
});

// Функция для генерации уникального реферального кода
function generateRefCode(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let refcode = '';
    for (let i = 0; i < length; i++) {
        refcode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return refcode;
}

// Создание пользователя с генерацией реферального кода
app.post('/create-user', async (req, res) => {
    const { telegramId, username, avatarUrl } = req.body;

    try {
        let refcode;
        let isUnique = false;

        // Генерация уникального реферального кода
        while (!isUnique) {
            refcode = generateRefCode();
            const existingUser = await User.findOne({ refcode });
            if (!existingUser) {
                isUnique = true;
            }
        }

        // Создание пользователя
        const newUser = new User({
            telegramId,
            username,
            avatarUrl,
            refcode,
            lastLogin: new Date(),
            tokens: 0, // начальное количество токенов
        });

        await newUser.save();
        res.status(201).json({ message: 'User created', refcode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Маршрут для получения дней пользователя
app.get('/api/user-days/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Ищем пользователя в базе данных
        const user = await User.findOne({ telegramId: userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        // Рассчитываем количество дней с момента старта
        const now = new Date();
        const startDate = user.startDate || now;
        const daysInGame = (now - startDate) / (1000 * 60 * 60 * 24); // Переводим миллисекунды в дни

        return res.json({
            success: true,
            daysInGame: daysInGame
        });
    } catch (error) {
        console.error('Ошибка при получении дней в игре:', error);
        return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
    }
});


// Маршрут для получения статистики пользователя
app.get('/api/top-stats/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Ищем пользователя в базе данных
        const user = await User.findOne({ telegramId: userId });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        // Возвращаем данные о статистике пользователя
        return res.json({
            success: true,
            avatarUrl: user.avatarUrl,
            username: user.username,
            tokens: user.tokens,
            rank: user.rank,
        });
    } catch (error) {
        console.error('Ошибка при получении статистики пользователя:', error);
        return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
    }
});

// Получение топ-100 пользователей
app.get('/api/top-users', async (req, res) => {
	try {
		const topUsers = await User.find().sort({ tokens: -1 }).limit(100);
		res.json(topUsers);
	} catch (error) {
		console.error('Ошибка при получении пользователей:', error);
		res.status(500).send('Ошибка сервера');
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

// Маршрут для получения количества приглашенных друзей
app.get('/api/friends-count/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findOne({ telegramId: userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }

        // Здесь мы предполагаем, что у вас есть поле "friendsCount" в модели пользователя
        return res.json({ success: true, friendsCount: user.friendsCount || 0 });
    } catch (error) {
        console.error('Ошибка при получении количества друзей:', error);
        return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
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

// Начало майнинга
app.post('/start-mining/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Проверяем, активен ли майнинг
        if (user.miningActive) {
            return res.status(400).json({ error: 'Майнинг уже активен' });
        }

        // Устанавливаем статус и время начала
        user.miningActive = true;
        user.miningStartTime = new Date(); // Устанавливаем текущее время
        await user.save();

        res.json({ success: true, miningStartTime: user.miningStartTime });
    } catch (error) {
        console.error('Ошибка при запуске майнинга:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение статуса майнинга
app.get('/mining-status/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        console.log('Найденный пользователь:', user); // Добавьте отладочный лог

        const miningActive = user.miningActive;
        const miningEndTime = user.miningStartTime 
            ? new Date(user.miningStartTime.getTime() + miningDuration) 
            : null;

        console.log('Статус майнинга:', { miningActive, miningEndTime }); // Лог статуса

        res.json({ miningActive, miningEndTime });
    } catch (error) {
        console.error('Ошибка при проверке статуса майнинга:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Начисление награды за майнинг
app.post('/claim-mining/:userId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.userId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.miningActive) {
            return res.status(400).json({ error: 'Майнинг не активен' });
        }

        // Проверяем, истек ли таймер
        const miningEndTime = new Date(user.miningStartTime.getTime() + miningDuration);

        if (Date.now() < miningEndTime.getTime()) {
            return res.status(400).json({ error: 'Майнинг еще не завершен' });
        }

        // Начисляем токены и сбрасываем статус майнинга
        user.tokens += 100;
        user.miningActive = false;
        user.miningStartTime = null;
        await user.save();

        res.json({ success: true, tokens: user.tokens });
    } catch (error) {
        console.error('Ошибка при начислении награды за майнинг:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Проверка реферального кода
app.get('/referral-code/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({ refCode: user.refcode });
    } catch (error) {
        console.error('Ошибка получения реферального кода:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

app.post('/activate-referral', async (req, res) => {
    const { telegramId, enteredRefCode } = req.body;

    try {
        // Поиск пользователя, который активирует реферальный код
        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Поиск реферера по реферальному коду
        const refUser = await User.findOne({ refcode: enteredRefCode });
        if (!refUser) {
            return res.status(404).json({ message: 'Referral code not found' });
        }

        // Проверка на то, что пользователь не может активировать свой собственный код
        if (user.refcode === enteredRefCode) {
            return res.status(400).json({ message: 'You cannot activate your own referral code' });
        }

        // Проверка на то, что пользователь еще не использовал реферальный код
        if (user.refUsed) {
            return res.status(400).json({ message: 'Referral code already used' });
        }

        // Начисление токенов
        user.tokens += 1000; // Начисляем 1000 токенов
        refUser.tokens += 500; // Начисляем 500 токенов рефереру
        refUser.friendsCount += 1; // Увеличиваем счетчик друзей
        user.refUsed = true; // Отмечаем, что код использован

        // Логирование перед сохранением
        console.log('User tokens:', user.tokens);
        console.log('RefUser tokens:', refUser.tokens);
        console.log('RefUser friendsCount:', refUser.friendsCount);

        // Сохраняем данные
        await user.save();
        await refUser.save();

        res.status(200).json({ message: 'Referral activated and tokens awarded' });
    } catch (error) {
        console.error('Ошибка при активации реферального кода:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


startServer();

// Объявляем URL изображения
const imageUrl = 'https://res.cloudinary.com/dvjohgg6j/image/upload/v1725631955/Banner/Novella%20banner.jpg'; // Публичный URL вашего изображения

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
	const chatId = msg.chat.id;
	const telegramId = msg.from.id; // Телеграм ID пользователя
	const userName = msg.from.username || '';
	
	// Получаем информацию об аватарке
	const photo = msg.from.photo;
	let avatarUrl = '';
	if (photo) {
		console.log('Photo data:', photo); // Отладочный вывод
		// Берем последний размер (самый большой)
		const fileId = photo[photo.length - 1].file_id;
		const file = await bot.getFile(fileId);
		avatarUrl = `https://api.telegram.org/file/bot${telegramBotToken}/${file.file_path}`;
	} else {
		console.log('No photo found for user'); // Отладочный вывод
	}


	try {
        // Ищем пользователя по Telegram ID
        let user = await User.findOne({ telegramId });

        if (!user) {
            // Создаем нового пользователя с реферальным кодом
            const response = await fetch('https://novella-app-novella-app.up.railway.app/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ telegramId, username: userName, avatarUrl }),
            });

            const data = await response.json();

            if (response.ok) {
                user = {
                    telegramId,
                    username: userName,
                    avatarUrl: avatarUrl,
                    refcode: data.refcode,
                    lastLogin: new Date(),
                    tokens: 0,
                };
                console.log(`User created with refcode: ${data.refcode}`);
            } else {
                console.error('Error creating user:', data.message);
                return bot.sendMessage(chatId, 'Failed to create user. Please try again later.');
			}
		} else {
			// Обновляем последний вход
			user.lastLogin = new Date();
			if (userName) {
				user.username = userName;
			}
			if (avatarUrl) {
				user.avatarUrl = avatarUrl; // Обновляем аватарку
			}
			await user.save();
		}

		// Проверка статуса пользователя
		if (user.status === 'banned') {
			return bot.sendMessage(chatId, 'Your account has been blocked. Please contact support.');
		}

		const webAppUrl = `https://novella-app-novella-app.up.railway.app/loading.html?userId=${telegramId}`; // Здесь использован telegramId

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