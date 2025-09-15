const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./config/db');

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);

// Boot-time check/initialization
async function initDB() {
  await sequelize.authenticate();
  await sequelize.sync(); // in prod, use migrations!
}
initDB().catch(console.error);

module.exports = app;
