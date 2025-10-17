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
      // Optional, only if SSL is needed
      ssl: process.env.DB_SSL === 'true' ? { /* your SSL options */ } : undefined,
    },
  }
);

sequelize.authenticate()
  .then(() => console.log('Database connected successfully.'))
  .catch(err => console.error('Database connection error:', err));
