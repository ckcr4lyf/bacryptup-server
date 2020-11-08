import { Router } from 'express';
import healthzHandler from './controllers/healthz';
import quotaHandler from './controllers/quota';
import getFileHandler from './controllers/getFile';

const router = Router();
router.get('/healthz', healthzHandler);
router.get('/quota', quotaHandler);
router.get('/file/:id', getFileHandler);

export default router;