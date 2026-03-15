const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Worker = require('./App/models/Worker');
const workers = require('./data/workers');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to DB
connectDB();

// Import into DB
const importData = async () => {
    try {
        await Worker.deleteMany();
        await Worker.create(workers);

        console.log('Data Imported...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

// Delete data
const destroyData = async () => {
    try {
        await Worker.deleteMany();

        console.log('Data Destroyed...');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
