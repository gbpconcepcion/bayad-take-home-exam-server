const mongoose = require('mongoose');

//connection to mongodb cloud using mongoose
const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected On Port: ${conn.connection.host}`.magenta.underline.bold)
    
};

module.exports = connectDB;