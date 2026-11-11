import { Router } from 'express';
import EmployeeController from '../controllers/employeeController.js';
import {
  validateEmployeePayload,
  validateEmployeeId,
} from '../middleware/validationMiddleware.js';

const router = Router();

// Dashboard Aggregate Statistics
router.get('/stats/summary', EmployeeController.getSummaryStats);

// Employee CRUD Routes
router.get('/', EmployeeController.getAllEmployees);
router.post('/', validateEmployeePayload, EmployeeController.createEmployee);
router.get('/:id', validateEmployeeId, EmployeeController.getEmployeeById);
router.put('/:id', validateEmployeeId, validateEmployeePayload, EmployeeController.updateEmployee);
router.delete('/:id', validateEmployeeId, EmployeeController.deleteEmployee);

export default router;

