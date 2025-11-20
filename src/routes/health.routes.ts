import { Router } from 'express';
import healthController from '../controllers/health.controller';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Basic health check
 * @access  Public
 */
router.get('/', healthController.healthCheck.bind(healthController));

/**
 * @route   GET /api/v1/health/detailed
 * @desc    Detailed health check with dependencies status
 * @access  Public
 */
router.get('/detailed', healthController.detailedHealthCheck.bind(healthController));

/**
 * @route   GET /api/v1/health/ready
 * @desc    Readiness check for Kubernetes
 * @access  Public
 */
router.get('/ready', healthController.readinessCheck.bind(healthController));

/**
 * @route   GET /api/v1/health/live
 * @desc    Liveness check for Kubernetes
 * @access  Public
 */
router.get('/live', healthController.livenessCheck.bind(healthController));

export default router;
