import fs from 'fs';
import express from 'express';

import apiRoutes from './routes/api';

const app = express();
const port = process.env.PORT || 5000;

(async () => {
  if (!fs.existsSync('temp')) {
    console.warn('temp directory does not exist, creating it');
    fs.mkdirSync('temp');
  }

  app.use('/', apiRoutes);

  app.listen(port, () => console.log(`server listening on port ${port}`));
})();
