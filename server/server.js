import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seedData.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database (gracefully handles local/Atlas connection)
  const conn = await connectDB();
  if (conn) {
    await seedDatabase();
  }

  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` HeliosFlow Solar Management Server running on port ${PORT}`);
    console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(` Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[UnhandledRejection Error]: ${err.message}`);
    // server.close(() => process.exit(1));
  });
};

startServer();
