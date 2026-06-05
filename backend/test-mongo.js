const mongoose = require('mongoose');

const MONGODB_URI = '"mongodb://hbnnews24live_db_user:DigitalORRA@ac-1hujp8y-shard-00-00.491bez6.mongodb.net:27017,ac-1hujp8y-shard-00-01.491bez6.mongodb.net:27017,ac-1hujp8y-shard-00-02.491bez6.mongodb.net:27017/hbnnews24?ssl=true&replicaSet=atlas-v0cnw9-shard-0&authSource=admin&appName=hbnnews24"';

async function testConnection() {
    console.log("Attempting to connect with quotes...");
    try {
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log("Successfully connected!");
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

testConnection();
