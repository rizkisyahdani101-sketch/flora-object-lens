/**
 * Flora & Object Lens — Backend
 * Express.js server + SQLite database
 */

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const galleryRoutes = require('./routes/gallery');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ===== API Routes =====
app.use('/api/gallery', galleryRoutes);

// ===== Serve frontend =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`🚀 Flora & Object Lens server berjalan di http://localhost:${PORT}`);
  console.log(`📦 Database: ${path.join(__dirname, 'gallery.db')}`);
});
