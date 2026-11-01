import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import customerRoutes from './routes/customer.routes.js';
import enquiryRoutes from './routes/enquiry.routes.js';
import surveyRoutes from './routes/survey.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import quotationPublicRoutes from './routes/quotation-public.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import installationRoutes from './routes/installation.routes.js';
import warrantyRoutes from './routes/warranty.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import financeRoutes from './routes/finance.routes.js';
import razorpayRoutes from './routes/razorpay.routes.js';
import voiceAssistantRoutes from './routes/voiceAssistant.routes.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
const allowedOrigins = [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(
  (value, index, all) => value && all.indexOf(value) === index
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use('/api/razorpay', razorpayRoutes);
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/public/quotations', quotationPublicRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/installations', installationRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/voice-assistant', voiceAssistantRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
