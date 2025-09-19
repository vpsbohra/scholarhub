const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./config/db');
const path = require('path');
const { uploadsBase } = require('./config/upload');

dotenv.config();
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(routes);
app.use(errorHandler);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Boot-time check/initialization
async function initDB() {
  await sequelize.authenticate();
  await sequelize.sync(); // in prod, use migrations!
}
initDB().catch(console.error);

module.exports = app;
