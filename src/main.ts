import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import trash from './core/Trash';
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
  } else {
    trash.emptyDir();
  }

  setInterval(() => {
    trash.clear();
  }, 1000 * 60 * 2);

  app.use(morgan('dev'));
  app.use(cors(corsOptions));
  app.use('/', apiRoutes);

  app.listen(port, () => console.log(`server listening on port ${port}`));
})();
