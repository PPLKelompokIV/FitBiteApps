const express = require('express');
const cors = require('cors');
require('dotenv').config();

<<<<<<< Updated upstream
=======
const adminFoodsRouter = require('./routes/adminFoods');
const { router: smartRemindersRouter } = require('./routes/smartReminders');

>>>>>>> Stashed changes
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Node.js FitBite Utama Berjalan!');
});

<<<<<<< Updated upstream
=======
app.use('/api/admin/foods', adminFoodsRouter);
app.use('/api/smart-reminders', smartRemindersRouter);

app.use((error, req, res, next) => {
  console.error('Kesalahan API:', error);
  return res.status(500).json({
    message: 'Terjadi kesalahan saat menyimpan konfigurasi pengingat',
  });
});

>>>>>>> Stashed changes
app.listen(PORT, () => {
  console.log(`Server Node.js berjalan di http://localhost:${PORT}`);
});