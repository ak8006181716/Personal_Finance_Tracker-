import express from 'express';
import { registerUser, loginUser,logoutUser,getUserProfile} from '../controllers/user.Controller.js';
import { auth } from '../middlewares/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// Register a new user
router.post('/register', asyncHandler(registerUser));

// Login user
router.post('/login',loginUser);

// Get user profile (protected)
router.get('/profile', auth,getUserProfile);

// Logout
router.post('/logout', auth, logoutUser);



export default router;
