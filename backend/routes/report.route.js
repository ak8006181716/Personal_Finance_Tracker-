import express from 'express';
import {auth} from '../middlewares/auth.js'; // correct
import Expense from '../models/expence_model.js';
import sqlite3 from 'sqlite3';

const router = express.Router();

// Dashboard summary
router.get('/dashboard', auth, async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const expenses = await Expense.find({ userId: req.user._id, date: { $gte: startOfMonth } });

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const categoryMap = {};
    const paymentMap = {};

    expenses.forEach(e => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
      paymentMap[e.paymentMethod] = (paymentMap[e.paymentMethod] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
    const topPayments = Object.entries(paymentMap).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);

    res.json({ total, topCategory, topPayments, categoryMap });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save monthly report to SQLite (basic example)
router.post('/save-monthly', auth, async (req, res) => {
  // expected body: { month: 'YYYY-MM', totalSpent, topCategory, overbudgetCategories }
  const db = new sqlite3.Database(process.env.SQLITE_FILE || './reports.db');
  const { month, totalSpent, topCategory, overbudgetCategories } = req.body;

  db.run(
    `CREATE TABLE IF NOT EXISTS monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      userId TEXT, 
      month TEXT, 
      totalSpent REAL, 
      topCategory TEXT, 
      overbudgetCategories TEXT
    )`
  );

  db.run(
    `INSERT INTO monthly_reports (userId, month, totalSpent, topCategory, overbudgetCategories) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      req.user._id.toString(),
      month,
      totalSpent,
      topCategory,
      JSON.stringify(overbudgetCategories || [])
    ],
    function (err) {
      if (err) {
        res.status(500).json({ message: 'Failed to save report' });
      } else {
        res.json({ message: 'Monthly report saved' });
      }
      db.close();
    }
  );
});

export default router;
