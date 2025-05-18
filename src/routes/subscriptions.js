import express from 'express';
import models from '../models/index.js';
import { sendConfirmationEmail } from '../utils/email.js';
import logger from '../utils/logger.js';
import crypto from 'crypto';

const router = express.Router();
const confirmRouter = express.Router();
const unsubscribeRouter = express.Router();

/**
 * @swagger
 * /subscribe:
 *   post:
 *     tags:
 *       - subscription
 *     summary: Subscribe to weather updates
 *     description: Subscribe an email to receive weather updates for a specific city with chosen frequency.
 *     operationId: subscribe
 *     consumes:
 *       - application/x-www-form-urlencoded
 *     parameters:
 *       - name: email
 *         in: formData
 *         description: Email address to subscribe
 *         required: true
 *         type: string
 *       - name: city
 *         in: formData
 *         description: City for weather updates
 *         required: true
 *         type: string
 *       - name: frequency
 *         in: formData
 *         description: Frequency of updates (hourly or daily)
 *         required: true
 *         type: string
 *         enum: [hourly, daily]
 *     responses:
 *       200:
 *         description: Subscription successful. Confirmation email sent.
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already subscribed
 */
router.post('/', async (req, res) => {
  try {
    const { email, city, frequency } = req.body;

    // Validate input
    if (!email || !city || !frequency) {
      return res.status(400).json({ error: 'Email, city, and frequency are required' });
    }

    if (!['hourly', 'daily'].includes(frequency)) {
      return res.status(400).json({ error: 'Frequency must be either hourly or daily' });
    }

    // Check for existing subscription
    const existingSubscription = await models.Subscription.findOne({
      where: { email, city }
    });

    if (existingSubscription) {
      return res.status(409).json({ error: 'Email already subscribed for this city' });
    }

    // Create subscription
    const token = crypto.randomBytes(32).toString('hex');
    const subscription = await models.Subscription.create({
      email,
      city,
      frequency,
      token,
      confirmed: false
    });

    // Send confirmation email
    await sendConfirmationEmail(email, token);

    res.json({
      message: 'Subscription successful. Please check your email to confirm.',
      token: subscription.token
    });
  } catch (error) {
    logger.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

/**
 * @swagger
 * /confirm/{token}:
 *   get:
 *     tags:
 *       - subscription
 *     summary: Confirm email subscription
 *     description: Confirms a subscription using the token sent in the confirmation email.
 *     operationId: confirmSubscription
 *     parameters:
 *       - name: token
 *         in: path
 *         description: Confirmation token
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Subscription confirmed successfully
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Token not found
 */
confirmRouter.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const subscription = await models.Subscription.findOne({ where: { token } });

    if (!subscription) {
      return res.status(404).json({ error: 'Token not found' });
    }

    if (subscription.confirmed) {
      return res.status(400).json({ error: 'Subscription already confirmed' });
    }

    await subscription.update({ confirmed: true });
    res.json({ message: 'Subscription confirmed successfully' });
  } catch (error) {
    logger.error('Subscription confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

/**
 * @swagger
 * /unsubscribe/{token}:
 *   get:
 *     tags:
 *       - subscription
 *     summary: Unsubscribe from weather updates
 *     description: Unsubscribes an email from weather updates using the token sent in emails.
 *     operationId: unsubscribe
 *     parameters:
 *       - name: token
 *         in: path
 *         description: Unsubscribe token
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       400:
 *         description: Invalid token
 *       404:
 *         description: Token not found
 */
unsubscribeRouter.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const subscription = await models.Subscription.findOne({ where: { token } });

    if (!subscription) {
      return res.status(404).json({ error: 'Token not found' });
    }

    await subscription.destroy();
    res.json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
  }
});

export { router as subscribeRouter, confirmRouter, unsubscribeRouter }; 