import express from 'express';
import { getWeather } from '../utils/weather.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * /weather:
 *   get:
 *     tags:
 *       - weather
 *     summary: Get current weather for a city
 *     description: Returns the current weather forecast for the specified city using WeatherAPI.com.
 *     operationId: getWeather
 *     parameters:
 *       - name: city
 *         in: query
 *         description: City name for weather forecast
 *         required: true
 *         type: string
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Successful operation - current weather forecast returned
 *         schema:
 *           $ref: '#/definitions/Weather'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: City not found
 */
router.get('/', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }

    const weather = await getWeather(city);
    res.json(weather);
  } catch (error) {
    if (error.message === 'City not found') {
      return res.status(404).json({ error: 'City not found' });
    }
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router; 