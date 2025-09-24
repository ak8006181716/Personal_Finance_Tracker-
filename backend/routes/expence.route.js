import express from 'express';
import { 
    createExpence, 
    getExpences, 
    getAllExpenseByID, 
    updateExpence, 
    deleteExpence 
} from '../controllers/expence.Controller.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// Create a new expence (protected)
router.post('/', auth, createExpence);

// Get all expences for the authenticated user with filters (protected)
router.get('/', auth, getAllExpenseByID);

// Get a single expence by ID (protected)
router.get('/:id', auth, getAllExpenseByID);

// Update an expence by ID (protected)
router.put('/:id', auth, updateExpence);

// Delete an expence by ID (protected)
router.delete('/:id', auth, deleteExpence);

export default router;
