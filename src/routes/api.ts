import { Router } from 'express';

import infoController from '../controllers/info';
import convertController from '../controllers/convert';
import downloadController from '../controllers/download';

const router = Router();

router.get('/info', infoController);
router.get('/convert', convertController);
router.get('/download', downloadController);

export default router;
