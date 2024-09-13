import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createUser } from './controller/userController.js';
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch((err) => console.log(err));

// Routes
app.post('/api/users', createUser);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
