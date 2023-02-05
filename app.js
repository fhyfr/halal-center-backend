require('dotenv').config();

const logger = require('./src/helpers/logger');

const PORT = process.env.PORT || 3000;
logger.info(`server listening on port: ${PORT}`);
