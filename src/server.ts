import express from "express";
import dotenv from "dotenv";

//Load env variables from .env file
dotenv.config();

// Import database after env is loaded so process.env is available during module init
const { connectDB } = await import("./config/database.js");

const app = express();
const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    environment: process.env.NODE_ENV 
  });
});


connectDB().then(_ => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
}).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
})