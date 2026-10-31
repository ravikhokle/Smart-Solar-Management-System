import Survey from '../models/Survey.js';
import mongoose from 'mongoose';
import { mockData } from '../utils/seedData.js';

class SurveyService {
  async getAllSurveys(status = '') {
    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (status && status !== 'all') {
        query.status = status;
      }
      return await Survey.find(query).populate('customer project').sort({ auditDate: -1 });
    } else {
      let results = [...mockData.surveys];
      if (status && status !== 'all') {
        results = results.filter((s) => s.status === status);
      }
      return results;
    }
  }

  async getSurveyById(id) {
    if (mongoose.connection.readyState === 1) {
      const survey = await Survey.findById(id).populate('customer project');
      if (!survey) throw new Error(`Survey with ID ${id} not found`);
      return survey;
    }
    const survey = mockData.surveys.find((s) => s._id === id);
    if (!survey) throw new Error(`Survey with ID ${id} not found`);
    return survey;
  }

  async createSurvey(data) {
    const surveyCode = data.surveyCode || `SRV-2026-${Math.floor(100 + Math.random() * 900)}`;
    const surveyData = { ...data, surveyCode };

    if (mongoose.connection.readyState === 1) {
      return await Survey.create(surveyData);
    } else {
      const newSurvey = {
        _id: 'srv_' + Date.now(),
        ...surveyData,
        auditDate: data.auditDate || new Date().toISOString(),
      };
      mockData.surveys.unshift(newSurvey);
      return newSurvey;
    }
  }

  async updateSurvey(id, data) {
    if (mongoose.connection.readyState === 1) {
      const survey = await Survey.findByIdAndUpdate(id, data, { new: true, runValidators: true });
      if (!survey) throw new Error(`Survey with ID ${id} not found`);
      return survey;
    } else {
      const idx = mockData.surveys.findIndex((s) => s._id === id);
      if (idx === -1) throw new Error(`Survey with ID ${id} not found`);
      mockData.surveys[idx] = { ...mockData.surveys[idx], ...data };
      return mockData.surveys[idx];
    }
  }

  async deleteSurvey(id) {
    if (mongoose.connection.readyState === 1) {
      const survey = await Survey.findByIdAndDelete(id);
      if (!survey) throw new Error(`Survey with ID ${id} not found`);
      return survey;
    } else {
      const idx = mockData.surveys.findIndex((s) => s._id === id);
      if (idx === -1) throw new Error(`Survey with ID ${id} not found`);
      return mockData.surveys.splice(idx, 1)[0];
    }
  }
}

export default new SurveyService();
