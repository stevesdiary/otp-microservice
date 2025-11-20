import { Router } from 'express';
import otpRoutes from './otp.routes';
import healthRoutes from './health.routes';

const router: Router = Router();

// API version prefix
const API_VERSION = '/v1';

// Mount routes
router.use(`${API_VERSION}/otp`, otpRoutes);
router.use(`${API_VERSION}/health`, healthRoutes);

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    service: 'OTP Microservice',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      otp: `${API_VERSION}/otp`,
      health: `${API_VERSION}/health`,
    },
  });
});

export default router;
