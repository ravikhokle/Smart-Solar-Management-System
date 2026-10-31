import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/project.routes.js';
import customerRoutes from './routes/customer.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import healthRoutes from './routes/health.routes.js';

// Middleware
import { errorHandler, notFound } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/surveys', surveyRoutes);

// Root greeting
app.get('/', (req, res) => {
  res.json({
    name: 'HeliosFlow - Smart Solar Management API',
    version: '1.0.0',
    documentation: '/api/health',
    status: 'Operational',
  });
});

// Centralized 404 & Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
