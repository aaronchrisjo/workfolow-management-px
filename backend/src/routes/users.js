import express from 'express';
import bcrypt from 'bcryptjs';
import { all, get, query } from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users (admin, supervisor and allocator can see all users)
router.get('/', requireRole('admin', 'supervisor', 'allocator'), (req, res) => {
  try {
    const users = all(`
      SELECT id, email, name, role, createdAt
      FROM users
      ORDER BY createdAt DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user info
router.get('/me', (req, res) => {
  try {
    const user = get(`
      SELECT id, email, name, role, createdAt
      FROM users
      WHERE id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new user (admin and supervisor only)
router.post('/', requireRole('admin', 'supervisor'), (req, res) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['admin', 'supervisor', 'allocator', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = query(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `, [email, hashedPassword, name, role]);

    const newUser = get(`
      SELECT id, email, name, role, createdAt
      FROM users
      WHERE id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newUser);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user (admin and supervisor only)
router.put('/:id', requireRole('admin', 'supervisor'), (req, res) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;

  try {
    const user = get('SELECT * FROM users WHERE id = ?', [id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = [];
    const values = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role) {
      if (!['admin', 'supervisor', 'allocator', 'employee'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      updates.push('role = ?');
      values.push(role);
    }
    if (password) {
      const hashedPassword = bcrypt.hashSync(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);

    query(updateQuery, values);

    const updatedUser = get(`
      SELECT id, email, name, role, createdAt
      FROM users
      WHERE id = ?
    `, [id]);

    res.json(updatedUser);
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin and supervisor only)
router.delete('/:id', requireRole('admin', 'supervisor'), (req, res) => {
  const { id } = req.params;

  try {
    const result = query('DELETE FROM users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
