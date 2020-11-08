import { Router } from 'express';
import healthzHandler from './controllers/healthz';
import quotaHandler from './controllers/quota';

const router = Router();
router.get('/healthz', healthzHandler);
router.get('/quota', quotaHandler);

export default router;