import express from 'express';
import { createApi } from './lib/api.js';

const app = express();
app.use('/api', createApi());

export default app;
