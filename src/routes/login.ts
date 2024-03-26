import express from 'express';
import controller from '../controllers/login';

const router = express.Router();

router.post('/', controller.login);

export default router;