import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import app from './app.js';

async function start() {
  try {
    await connectDb();
    app.listen(env.port, () => {
      console.log(`HeliosFlow API listening on port ${env.port}`);
    });
  } catch (err) {
    const message = err.message || 'Unknown error';
    if (/bad auth|authentication failed/i.test(message)) {
      console.error(
        'Failed to start server: MongoDB authentication failed. Check MONGODB_URI (or MONGO_URI) in server/.env, including username, password, and Atlas database user.'
      );
    } else {
      console.error('Failed to start server:', message);
    }
    process.exit(1);
  }
}

start();
