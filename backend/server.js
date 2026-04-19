require('dotenv').config();
const app = require('./src/app');
const { connectDB, sequelize } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // sync({ alter: true }) updates tables to match models without dropping data
  await sequelize.sync({ alter: true });
  console.log('✅ Database synced');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
  });
};

startServer();
