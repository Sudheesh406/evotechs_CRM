const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT), 
    dialect: 'mysql',
    dialectOptions: {
      ssl: {
        ca: fs.readFileSync(path.join(__dirname, 'certs/ca.pem')),
      },
    },
    logging: false,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
  }
};

module.exports = { sequelize, connectDB };
