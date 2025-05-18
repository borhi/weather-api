import fetch from 'node-fetch';
import logger from './logger.js';

export const getWeather = async (city) => {
  try {
    if (!process.env.WEATHER_API_KEY) {
      throw new Error('Weather API key is not configured');
    }

    if (!process.env.WEATHER_API_URL) {
      throw new Error('Weather API URL is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), process.env.WEATHER_API_TIMEOUT || 5000);

    const apiUrl = new URL('current.json', process.env.WEATHER_API_URL);
    apiUrl.searchParams.append('key', process.env.WEATHER_API_KEY);
    apiUrl.searchParams.append('q', city);
    apiUrl.searchParams.append('aqi', 'no');

    logger.info('Making weather API request:', {
      url: apiUrl.toString().replace(process.env.WEATHER_API_KEY, 'REDACTED'),
      city
    });

    const response = await fetch(apiUrl.toString(), { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Weather-API-Service/1.0'
      }
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      logger.error('Weather API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        url: apiUrl.toString().replace(process.env.WEATHER_API_KEY, 'REDACTED')
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid or expired Weather API key');
      }
      if (response.status === 404) {
        throw new Error('City not found');
      }
      if (response.status === 429) {
        throw new Error('Weather API rate limit exceeded');
      }
      throw new Error(`Weather API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.current) {
      logger.error('Invalid weather data received:', data);
      throw new Error('Invalid weather data received');
    }

    return {
      temperature: data.current.temp_c,
      humidity: data.current.humidity,
      description: data.current.condition.text
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.error('Weather API request timeout');
      throw new Error('Weather API request timed out');
    }
    logger.error('Weather API error:', error);
    throw error;
  }
}; 