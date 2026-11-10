const express = require('express');
const cors = require('cors');
require('dotenv').config();

const adminFoodsRouter = require('./routes/adminFoods');

let smartRemindersRouter = null;
try {
  smartRemindersRouter = require('./routes/smartReminders').router;
} catch {
  // smartReminders kini berada di Python FastAPI (app/routers/reminders.py)
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node.js FitBite Utama Berjalan!');
});

app.use('/api/admin/foods', adminFoodsRouter);

if (smartRemindersRouter) {
  app.use('/api/smart-reminders', smartRemindersRouter);
}

app.use((error, req, res, next) => {
  console.error('Kesalahan API:', error);
  return res.status(500).json({
    message: 'Terjadi kesalahan pada server',
  });
});

app.listen(PORT, () => {
  console.log(`Server Node.js berjalan di http://localhost:${PORT}`);
});
