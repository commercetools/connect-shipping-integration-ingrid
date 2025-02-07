import * as dotenv from 'dotenv';
dotenv.config();

import { logger } from './utils/logger.utils';

import app from './app';

const PORT = 8090;

// Listen the application
const server = app.listen(PORT, () => {
  logger.info(`⚡️ Event application listening on port ${PORT}`);
});

export default server;
