const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, 'config.env') });

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const queueRoutes = require('./routes/queueRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  const port = process.env.PORT || 3001;
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('Missing required env var: MONGODB_URI');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

