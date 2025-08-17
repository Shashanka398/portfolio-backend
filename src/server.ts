import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import knowledgeRoutes from './routes/knowlegeRoutes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/portfolio', knowledgeRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Portfolio Backend API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
