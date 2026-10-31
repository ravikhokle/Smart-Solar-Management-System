import customerService from '../services/customer.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

export const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const customers = await customerService.getAllCustomers(search);
    return sendSuccess(res, 200, 'Customers retrieved successfully', customers, {
      total: customers.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return sendSuccess(res, 200, 'Customer retrieved successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return sendError(res, 400, 'Customer name, email, and phone are required');
    }
    const customer = await customerService.createCustomer(req.body);
    return sendSuccess(res, 201, 'Customer created successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return sendSuccess(res, 200, 'Customer updated successfully', customer);
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.deleteCustomer(req.params.id);
    return sendSuccess(res, 200, 'Customer deleted successfully', customer);
  } catch (error) {
    next(error);
  }
};
