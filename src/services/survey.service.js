import api from './api';

export const surveyService = {
  getSurveys: async (params = {}) => {
    const response = await api.get('/surveys', { params });
    return response.data;
  },

  getSurveyById: async (id) => {
    const response = await api.get(`/surveys/${id}`);
    return response.data;
  },

  createSurvey: async (surveyData) => {
    const response = await api.post('/surveys', surveyData);
    return response.data;
  },

  updateSurvey: async (id, surveyData) => {
    const response = await api.put(`/surveys/${id}`, surveyData);
    return response.data;
  },

  deleteSurvey: async (id) => {
    const response = await api.delete(`/surveys/${id}`);
    return response.data;
  },
};

export default surveyService;
