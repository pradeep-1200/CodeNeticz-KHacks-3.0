const { connectMongoDB } = require('../src/config/mongodb');

const connectDB = async () => {
    await connectMongoDB();
};

module.exports = connectDB;
