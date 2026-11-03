/**
 * Database initialization & helpers
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const db = new DatabaseSync(path.join(__dirname, 'gallery.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    cls TEXT NOT NULL,
    confidence REAL NOT NULL,
    imageData TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    favourite INTEGER DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_timestamp ON gallery(timestamp);
`);

module.exports = db;
