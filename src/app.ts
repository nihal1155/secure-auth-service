import express, {type Express} from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js'

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    environment: process.env.NODE_ENV 
  });
});

// Mount auth routes at /api/auth
app.use('/api/auth', authRoutes);

export default app;