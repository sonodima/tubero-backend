import express from 'express';

import apiRoutes from './routes/api';

const app = express();
const port = 5000;

app.use('/', apiRoutes);

app.listen(port, () => console.log(`server listening on port ${port}`));
