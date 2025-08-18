require('dotenv').config();  // if you want to load env vars here

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.HOST,
    dialect: 'mysql',
    logging: false,
  }
  
};