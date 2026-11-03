const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all gallery items
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM gallery ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single item
router.get('/:id', (req, res) => {
  try {
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Tidak ditemukan' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new item
router.post('/', (req, res) => {
  try {
    const { name, type, cls, confidence, imageData, timestamp } = req.body;
    const result = db.prepare(`
      INSERT INTO gallery (name, type, cls, confidence, imageData, timestamp, favourite)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(name, type, cls, confidence, imageData, timestamp);
    const id = result.lastInsertRowid;
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(id);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item (toggle favourite)
router.put('/:id', (req, res) => {
  try {
    const { favourite } = req.body;
    if (favourite === undefined) {
      return res.status(400).json({ error: 'Field "favourite" wajib diberikan' });
    }
    db.prepare('UPDATE gallery SET favourite = ? WHERE id = ?').run(favourite, req.params.id);
    const item = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item
router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Dihapus' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
