import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'workflow.db');

let db = null;
let SQL = null;

// Initialize SQL.js
async function initDB() {
  SQL = await initSqlJs();

  // Load existing database or create new one
  if (existsSync(dbPath)) {
    const buffer = readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

// Save database to file
export function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

// Initialize database schema
export async function initializeDatabase() {
  await initDB();

  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'supervisor', 'allocator', 'employee')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Loads/Tickets table
  db.run(`
    CREATE TABLE IF NOT EXISTS loads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      clientName TEXT NOT NULL,
      clientNumber TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('pending', 'in_progress', 'paused', 'completed', 'transferred')),
      assignedTo INTEGER,
      createdBy INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  saveDatabase();

  // Create default admin user if none exists
  const result = db.exec('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
  const adminExists = result.length > 0 && result[0].values[0][0] > 0;

  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.run(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      ['admin@workflow.com', hashedPassword, 'Admin User', 'admin']
    );
    saveDatabase();

    console.log('Default admin user created:');
    console.log('  Email: admin@workflow.com');
    console.log('  Password: admin123');
  }

  console.log('Database initialized successfully');
}

// Helper function to run queries
export function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');

  try {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified(), lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0].values[0][0] };
  } catch (error) {
    throw error;
  }
}

// Helper function to get single row
export function get(sql, params = []) {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare(sql);
  stmt.bind(params);

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  stmt.free();
  return null;
}

// Helper function to get all rows
export function all(sql, params = []) {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare(sql);
  stmt.bind(params);

  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }

  stmt.free();
  return rows;
}

export { db };
