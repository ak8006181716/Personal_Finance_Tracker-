import express from 'express';
import { setOrUpadateBudget, GetBudget } from '../controllers/budget.Controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Set or update a budget (protected)
router.post('/', auth, setOrUpadateBudget);

// Get all budgets for the authenticated user (protected)
router.get('/', auth, GetBudget);

export default router;
