const crypto = require('crypto');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Subscriptions', [
      {
        email: 'demo1@example.com',
        city: 'London',
        frequency: 'daily',
        confirmed: true,
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'demo2@example.com',
        city: 'Paris',
        frequency: 'hourly',
        confirmed: true,
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'demo3@example.com',
        city: 'New York',
        frequency: 'daily',
        confirmed: false,
        token: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Subscriptions', null, {});
  }
}; 