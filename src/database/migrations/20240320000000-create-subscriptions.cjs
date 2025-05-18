module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      frequency: {
        type: Sequelize.ENUM('hourly', 'daily'),
        allowNull: false,
        defaultValue: 'daily'
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      lastSent: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Check if the index exists before creating it
    const indexes = await queryInterface.showIndex('Subscriptions');
    const indexExists = indexes.some(index => index.name === 'subscriptions_email_city');
    if (!indexExists) {
      await queryInterface.addIndex('Subscriptions', ['email', 'city'], {
        unique: true,
        name: 'subscriptions_email_city'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Subscriptions');
  }
}; 