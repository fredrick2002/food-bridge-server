const mysql = require('mysql');
const mongoose = require('mongoose');
require('dotenv').config();

// MySQL connection pool configuration
const mysqlPool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: "",
    database: process.env.DB_NAME
});

// MongoDB connection configuration
mongoose.connect('mongodb://localhost:27017/food-bridge', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

module.exports = {
    mysqlPool,
    mongoose
};
