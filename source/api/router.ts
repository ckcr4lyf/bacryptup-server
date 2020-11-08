import { Router } from 'express';
import healthzHandler from './controllers/healthz';

const router = Router();
router.get('/healthz', healthzHandler);

export default router;