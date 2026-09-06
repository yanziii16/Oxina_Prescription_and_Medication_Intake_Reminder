const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5175'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medicationDB')
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

const medicationRoutes = require('./routes/medicationRoutes');
app.use('/api/medications', medicationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});