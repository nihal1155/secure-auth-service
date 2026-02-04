import 'dotenv/config';
import app from './app.js';

// Import database after env is loaded so process.env is available during module init
import { connectDB } from "./config/database.js";

//Load env variables from .env file
// dotenv.config();

const PORT = 3000;

connectDB().then(_ => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
}).catch((error) => {
    console.error('Failed to start the server:', error);
    process.exit(1);
})