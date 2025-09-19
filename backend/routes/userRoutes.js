import express from 'express';
import { registerUser, loginUser, getUser } from '../controllers/userController.js'; // Added getUser import
import { protect } from '../middlewares/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUser); // Fixed: Replaced userRouter with getUser

export default userRouter;