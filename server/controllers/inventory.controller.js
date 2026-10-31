import inventoryService from '../services/inventory.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const getInventory = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const items = await inventoryService.getAllInventory(category, search);
    return sendSuccess(res, 200, 'Inventory items retrieved successfully', items, {
      total: items.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const items = await inventoryService.getLowStockAlerts();
    return sendSuccess(res, 200, 'Low stock alerts retrieved', items);
  } catch (error) {
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const { name, sku, category, unitCost, unitPrice } = req.body;
    if (!name || !sku || !category || unitCost === undefined || unitPrice === undefined) {
      return sendError(res, 400, 'Name, SKU, category, unit cost and price are required');
    }
    const item = await inventoryService.createItem(req.body);
    return sendSuccess(res, 201, 'Inventory item created successfully', item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    return sendSuccess(res, 200, 'Inventory item updated successfully', item);
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    const item = await inventoryService.deleteItem(req.params.id);
    return sendSuccess(res, 200, 'Inventory item deleted successfully', item);
  } catch (error) {
    next(error);
  }
};
