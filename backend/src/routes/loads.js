import express from 'express';
import { all, get, query } from '../database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all loads (filtered by role)
router.get('/', (req, res) => {
  try {
    let queryStr = `
      SELECT
        l.*,
        u.name as assignedToName,
        u.email as assignedToEmail,
        c.name as createdByName
      FROM loads l
      LEFT JOIN users u ON l.assignedTo = u.id
      LEFT JOIN users c ON l.createdBy = c.id
    `;

    let loads;
    if (req.user.role === 'employee') {
      queryStr += ' WHERE l.assignedTo = ? ORDER BY l.createdAt DESC';
      loads = all(queryStr, [req.user.id]);
    } else {
      queryStr += ' ORDER BY l.createdAt DESC';
      loads = all(queryStr);
    }

    res.json(loads);
  } catch (error) {
    console.error('Get loads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get loads by status
router.get('/status/:status', (req, res) => {
  const { status } = req.params;

  try {
    let queryStr = `
      SELECT
        l.*,
        u.name as assignedToName,
        u.email as assignedToEmail,
        c.name as createdByName
      FROM loads l
      LEFT JOIN users u ON l.assignedTo = u.id
      LEFT JOIN users c ON l.createdBy = c.id
      WHERE l.status = ?
    `;

    let loads;
    if (req.user.role === 'employee') {
      queryStr += ' AND l.assignedTo = ? ORDER BY l.createdAt DESC';
      loads = all(queryStr, [status, req.user.id]);
    } else {
      queryStr += ' ORDER BY l.createdAt DESC';
      loads = all(queryStr, [status]);
    }

    res.json(loads);
  } catch (error) {
    console.error('Get loads by status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single load
router.get('/:id', (req, res) => {
  const { id } = req.params;

  try {
    const load = get(`
      SELECT
        l.*,
        u.name as assignedToName,
        u.email as assignedToEmail,
        c.name as createdByName
      FROM loads l
      LEFT JOIN users u ON l.assignedTo = u.id
      LEFT JOIN users c ON l.createdBy = c.id
      WHERE l.id = ?
    `, [id]);

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (req.user.role === 'employee' && load.assignedTo !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(load);
  } catch (error) {
    console.error('Get load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new load (admin, supervisor and allocator only)
router.post('/', requireRole('admin', 'supervisor', 'allocator'), (req, res) => {
  const { clientName, clientNumber, status, assignedTo } = req.body;

  if (!clientName || !clientNumber) {
    return res.status(400).json({ error: 'Client name and number are required' });
  }

  const loadStatus = status || 'pending';

  if (!['pending', 'in_progress', 'paused', 'completed', 'transferred'].includes(loadStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = query(`
      INSERT INTO loads (clientName, clientNumber, status, assignedTo, createdBy)
      VALUES (?, ?, ?, ?, ?)
    `, [clientName, clientNumber, loadStatus, assignedTo || null, req.user.id]);

    const newLoad = get(`
      SELECT
        l.*,
        u.name as assignedToName,
        u.email as assignedToEmail,
        c.name as createdByName
      FROM loads l
      LEFT JOIN users u ON l.assignedTo = u.id
      LEFT JOIN users c ON l.createdBy = c.id
      WHERE l.id = ?
    `, [result.lastInsertRowid]);

    res.status(201).json(newLoad);
  } catch (error) {
    console.error('Create load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update load
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { clientName, clientNumber, status, assignedTo } = req.body;

  try {
    const load = get('SELECT * FROM loads WHERE id = ?', [id]);

    if (!load) {
      return res.status(404).json({ error: 'Load not found' });
    }

    if (req.user.role === 'employee') {
      if (load.assignedTo !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (status) {
        if (!['pending', 'in_progress', 'paused', 'completed', 'transferred'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        query('UPDATE loads SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
      }
    } else {
      const updates = [];
      const values = [];

      if (clientName) {
        updates.push('clientName = ?');
        values.push(clientName);
      }
      if (clientNumber) {
        updates.push('clientNumber = ?');
        values.push(clientNumber);
      }
      if (status) {
        if (!['pending', 'in_progress', 'paused', 'completed', 'transferred'].includes(status)) {
          return res.status(400).json({ error: 'Invalid status' });
        }
        updates.push('status = ?');
        values.push(status);
      }
      if (assignedTo !== undefined) {
        updates.push('assignedTo = ?');
        values.push(assignedTo);
      }

      if (updates.length > 0) {
        updates.push('updatedAt = CURRENT_TIMESTAMP');
        const updateQuery = `UPDATE loads SET ${updates.join(', ')} WHERE id = ?`;
        values.push(id);
        query(updateQuery, values);
      }
    }

    const updatedLoad = get(`
      SELECT
        l.*,
        u.name as assignedToName,
        u.email as assignedToEmail,
        c.name as createdByName
      FROM loads l
      LEFT JOIN users u ON l.assignedTo = u.id
      LEFT JOIN users c ON l.createdBy = c.id
      WHERE l.id = ?
    `, [id]);

    res.json(updatedLoad);
  } catch (error) {
    console.error('Update load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete load (admin, supervisor and allocator only)
router.delete('/:id', requireRole('admin', 'supervisor', 'allocator'), (req, res) => {
  const { id } = req.params;

  try {
    const result = query('DELETE FROM loads WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Load not found' });
    }

    res.json({ message: 'Load deleted successfully' });
  } catch (error) {
    console.error('Delete load error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
