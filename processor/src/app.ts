import express from 'express';
import cors from 'cors';
import sessionRoutes from './routes/session';

const ENABLER_HOST = process.env.ENABLER_HOST;

const app = express();
app.use(cors({
    //origin: 'http://localhost:3000', // Update this to match your Enabler's URL
    origin: ENABLER_HOST,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  }));
app.use(express.json());
app.use('/api/session', sessionRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
