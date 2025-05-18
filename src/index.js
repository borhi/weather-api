import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import models, { sequelize } from './models/index.js';
import weatherRoutes from './routes/weather.js';
import subscriptionRoutes from './routes/subscriptions.js';
import logger from './utils/logger.js';
import { CronJob } from 'cron';
import { getWeather } from './utils/weather.js';
import { sendWeatherUpdate } from './utils/email.js';
import swaggerOptions from './config/swagger.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.error('JSON Parse Error:', err);
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next(err);
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);

// Swagger setup
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Mount routes directly on /api
app.use('/api/weather', weatherRoutes);
app.use('/api/subscribe', subscriptionRoutes);
app.use('/api/confirm', subscriptionRoutes);
app.use('/api/unsubscribe', subscriptionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Weather update job
const sendWeatherUpdates = async () => {
  try {
    const subscriptions = await models.Subscription.findAll({
      where: { confirmed: true }
    });

    for (const subscription of subscriptions) {
      const now = new Date();
      const lastSent = subscription.lastSent || new Date(0);
      const hoursSinceLastUpdate = (now - lastSent) / (1000 * 60 * 60);

      if (
        (subscription.frequency === 'hourly' && hoursSinceLastUpdate >= 1) ||
        (subscription.frequency === 'daily' && hoursSinceLastUpdate >= 24)
      ) {
        try {
          const weather = await getWeather(subscription.city);
          await sendWeatherUpdate(subscription.email, subscription.city, weather, subscription.token);
          await subscription.update({ lastSent: now });
          logger.info(`Weather update sent to ${subscription.email} for ${subscription.city}`);
        } catch (error) {
          logger.error(`Failed to send weather update to ${subscription.email}:`, error);
        }
      }
    }
  } catch (error) {
    logger.error('Weather update job error:', error);
  }
};

// Schedule weather updates
const weatherUpdateJob = new CronJob('0 * * * *', sendWeatherUpdates); // Run every hour

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    await sequelize.sync();
    logger.info('Database synchronized');
    
    // Start weather update job
    weatherUpdateJob.start();
    logger.info('Weather update job started');
    
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

startServer(); 