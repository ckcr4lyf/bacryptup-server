import { Router } from 'express';

import uploadMiddleware from './middleware/upload';

import healthzHandler from './controllers/healthz';
import quotaHandler from './controllers/quota';
import getFileHandler from './controllers/getFile';
import newFileHandler from './controllers/newFile';

const router = Router();
router.get('/healthz', healthzHandler);
router.get('/quota', quotaHandler);
router.get('/file/:id', getFileHandler);
router.post('/file', uploadMiddleware, newFileHandler);

export default router;