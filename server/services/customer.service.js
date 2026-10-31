import Customer from '../models/Customer.js';
import mongoose from 'mongoose';
import { mockData } from '../utils/seedData.js';

class CustomerService {
  async getAllCustomers(search = '') {
    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
        ];
      }
      return await Customer.find(query).sort({ createdAt: -1 });
    } else {
      let results = [...mockData.customers];
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (c) =>
            c.name.toLowerCase().includes(s) ||
            c.email.toLowerCase().includes(s) ||
            (c.company && c.company.toLowerCase().includes(s))
        );
      }
      return results;
    }
  }

  async getCustomerById(id) {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findById(id);
      if (!customer) throw new Error(`Customer with ID ${id} not found`);
      return customer;
    }
    const customer = mockData.customers.find((c) => c._id === id);
    if (!customer) throw new Error(`Customer with ID ${id} not found`);
    return customer;
  }

  async createCustomer(data) {
    if (mongoose.connection.readyState === 1) {
      return await Customer.create(data);
    } else {
      const customer = {
        _id: 'cust_' + Date.now(),
        ...data,
        createdAt: new Date().toISOString(),
      };
      mockData.customers.unshift(customer);
      return customer;
    }
  }

  async updateCustomer(id, data) {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!customer) throw new Error(`Customer with ID ${id} not found`);
      return customer;
    } else {
      const idx = mockData.customers.findIndex((c) => c._id === id);
      if (idx === -1) throw new Error(`Customer with ID ${id} not found`);
      mockData.customers[idx] = { ...mockData.customers[idx], ...data };
      return mockData.customers[idx];
    }
  }

  async deleteCustomer(id) {
    if (mongoose.connection.readyState === 1) {
      const customer = await Customer.findByIdAndDelete(id);
      if (!customer) throw new Error(`Customer with ID ${id} not found`);
      return customer;
    } else {
      const idx = mockData.customers.findIndex((c) => c._id === id);
      if (idx === -1) throw new Error(`Customer with ID ${id} not found`);
      return mockData.customers.splice(idx, 1)[0];
    }
  }
}

export default new CustomerService();
