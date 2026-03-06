// Sentry must be initialized before any other require
const Sentry = require('@sentry/node');
require('dotenv').config();

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.2,
  });
}

const app = require('./app');
const sequelize = require('./config/database');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    await sequelize.sync({ alter: false });
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
