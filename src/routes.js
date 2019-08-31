import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';

const upload = multer(multerConfig);

const router = new Router();

router.post('/users', UserController.store);
router.post('/sessions', SessionController.store);

router.use(authMiddleware);
router.put('/users', UserController.update);

router.post('/files', upload.single('file'), FileController.store);
router.get('/providers', ProviderController.index);
router.get('/providers/:providerId/available', AvailableController.index);
router.post('/appointments', AppointmentController.store);
router.get('/appointments', AppointmentController.index);
router.delete('/appointments/:id', AppointmentController.delete);
router.get('/schedule', ScheduleController.index);
router.get('/notifications', NotificationController.index);
router.put('/notifications/:id', NotificationController.update);
module.exports = router;
