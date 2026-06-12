import express from 'express';
import { createApi } from '../src/server/api';

const app = express();
app.use('/api', createApi());

export default app;
