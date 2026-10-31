import express from 'express';
import {
  getInventory,
  getLowStock,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/inventory.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/alerts/low-stock', protect, getLowStock);

router
  .route('/')
  .get(protect, getInventory)
  .post(protect, authorize('admin', 'project_manager'), createItem);

router
  .route('/:id')
  .put(protect, authorize('admin', 'project_manager'), updateItem)
  .delete(protect, authorize('admin'), deleteItem);

export default router;
