const cron = require('node-cron');
const { updateRanks } = require('./updateRanks'); // Убедитесь, что функция экспортируется

// Запускаем обновление рангов каждую ночь в 2:00
cron.schedule('0 2 * * *', async () => {
    console.log('Обновление рангов...');
    await updateRanks();
});
