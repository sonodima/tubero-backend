import fs from 'fs';
import express from 'express';
import cors from 'cors';

import apiRoutes from './routes/api';

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

  app.use(cors(corsOptions));
  app.use('/', apiRoutes);

  app.listen(port, () => console.log(`server listening on port ${port}`));
})();
