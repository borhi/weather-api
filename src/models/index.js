import sequelize from '../config/database.js';
import subscriptionModel from './subscription.js';

const models = {
  Subscription: subscriptionModel(sequelize)
};

// Initialize models
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export { sequelize };
export default models; 