// checkUsers.js
const mongoose = require('mongoose');
const User = require('./models/User'); // Убедитесь, что путь к файлу правильный

// Подключение к MongoDB
mongoose.connect('mongodb+srv://nikitavaleyev:ngmrQJIBlaqvZisT@novellaapp.0pp0y.mongodb.net/novellaapp?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('connected', async () => {
    console.log('Connected to MongoDB');

    try {
        // Запрос всех пользователей
        const users = await User.find({});
        console.log('List of users:', users);
    } catch (err) {
        console.error('Error fetching users:', err);
    } finally {
        // Закрытие соединения с MongoDB
        mongoose.connection.close();
    }
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});
