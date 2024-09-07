const { MongoClient } = require('mongodb');

// Замените строку подключения на вашу
const uri = "mongodb+srv://nikitavaleyev:Valeyev26041986@novellaapp.0pp0y.mongodb.net/novellaapp?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('MongoDB connected successfully');

        const database = client.db('novellaapp'); // Замените на имя вашей базы данных

        // Очищаем базу данных
        await database.dropDatabase();
        console.log('Database cleared successfully');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

run().catch(console.dir);
