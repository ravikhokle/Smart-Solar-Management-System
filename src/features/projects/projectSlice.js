import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../../services/project.service';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params, { rejectWithValue }) => {
    try {
      const res = await projectService.getProjects(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchDashboardMetrics = createAsyncThunk(
  'projects/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const res = await projectService.getDashboardMetrics();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

export const addProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const res = await projectService.createProject(projectData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'projects/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await projectService.updateProject(id, { status });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update status');
    }
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    items: [],
    selectedProject: null,
    metrics: null,
    loading: false,
    error: null,
    filters: {
      status: 'all',
      priority: 'all',
      search: '',
    },
  },
  reducers: {
    setFilterStatus: (state, action) => {
      state.filters.status = action.payload;
    },
    setFilterSearch: (state, action) => {
      state.filters.search = action.payload;
    },
    setSelectedProject: (state, action) => {
      state.selectedProject = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Metrics
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      // Add Project
      .addCase(addProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update Project Status
      .addCase(updateProjectStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setFilterStatus, setFilterSearch, setSelectedProject } = projectSlice.actions;
export default projectSlice.reducer;
