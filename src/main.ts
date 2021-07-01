import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import Trash from './core/Trash';
import apiRoutes from './routes/api';

dotenv.config();
const app = express();
const port = process.env.PORT || 8080;

const corsOptions = {
  origin: '*',
};

(async () => {
  if (!fs.existsSync('temp')) {
    console.warn('temp directory does not exist, creating it');
    fs.mkdirSync('temp');
  }

  Trash.emptyDir();
  setInterval(() => {
    Trash.clear();
  }, 1000 * 60 * 10);

  app.use(morgan('dev'));
  app.use(cors(corsOptions));
  app.use('/', apiRoutes);

  app.listen(port, () => console.log(`server listening on port ${port}`));
})();
