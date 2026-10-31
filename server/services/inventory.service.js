import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';
import { mockData } from '../utils/seedData.js';

class InventoryService {
  async getAllInventory(category = '', search = '') {
    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { manufacturer: { $regex: search, $options: 'i' } },
        ];
      }
      return await Inventory.find(query).sort({ category: 1, name: 1 });
    } else {
      let results = [...mockData.inventory];
      if (category && category !== 'all') {
        results = results.filter((item) => item.category === category);
      }
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (item) =>
            item.name.toLowerCase().includes(s) ||
            item.sku.toLowerCase().includes(s) ||
            item.manufacturer.toLowerCase().includes(s)
        );
      }
      return results;
    }
  }

  async getLowStockAlerts() {
    if (mongoose.connection.readyState === 1) {
      return await Inventory.find({
        $expr: { $lte: ['$quantityInStock', '$minThreshold'] },
      });
    } else {
      return mockData.inventory.filter((item) => item.quantityInStock <= item.minThreshold);
    }
  }

  async createItem(data) {
    if (mongoose.connection.readyState === 1) {
      return await Inventory.create(data);
    } else {
      const item = {
        _id: 'inv_' + Date.now(),
        ...data,
      };
      mockData.inventory.push(item);
      return item;
    }
  }

  async updateItem(id, data) {
    if (mongoose.connection.readyState === 1) {
      const item = await Inventory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!item) throw new Error(`Inventory item with ID ${id} not found`);
      return item;
    } else {
      const idx = mockData.inventory.findIndex((i) => i._id === id);
      if (idx === -1) throw new Error(`Inventory item with ID ${id} not found`);
      mockData.inventory[idx] = { ...mockData.inventory[idx], ...data };
      return mockData.inventory[idx];
    }
  }

  async deleteItem(id) {
    if (mongoose.connection.readyState === 1) {
      const item = await Inventory.findByIdAndDelete(id);
      if (!item) throw new Error(`Inventory item with ID ${id} not found`);
      return item;
    } else {
      const idx = mockData.inventory.findIndex((i) => i._id === id);
      if (idx === -1) throw new Error(`Inventory item with ID ${id} not found`);
      return mockData.inventory.splice(idx, 1)[0];
    }
  }
}

export default new InventoryService();
