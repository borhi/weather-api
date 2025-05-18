import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendConfirmationEmail = async (email, token) => {
  const confirmUrl = `${process.env.APP_URL}/api/confirm/${token}`;
  const unsubscribeUrl = `${process.env.APP_URL}/api/unsubscribe/${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Confirm your weather subscription',
    html: `
      <h1>Welcome to Weather Updates!</h1>
      <p>Please confirm your subscription by clicking the link below:</p>
      <p><a href="${confirmUrl}">Confirm Subscription</a></p>
      <p>If you did not request this subscription, you can unsubscribe here:</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export const sendWeatherUpdate = async (email, city, weather, token) => {
  const unsubscribeUrl = `${process.env.APP_URL}/api/unsubscribe/${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `Weather Update for ${city}`,
    html: `
      <h1>Weather Update for ${city}</h1>
      <p>Current temperature: ${weather.temperature}°C</p>
      <p>Humidity: ${weather.humidity}%</p>
      <p>Conditions: ${weather.description}</p>
      <p>To unsubscribe from these updates, click here:</p>
      <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
    `
  };

  await transporter.sendMail(mailOptions);
}; 