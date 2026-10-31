import express from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getCustomers)
  .post(protect, authorize('admin', 'project_manager'), createCustomer);

router
  .route('/:id')
  .get(protect, getCustomerById)
  .put(protect, authorize('admin', 'project_manager'), updateCustomer)
  .delete(protect, authorize('admin'), deleteCustomer);

export default router;
