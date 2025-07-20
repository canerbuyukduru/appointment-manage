import express from 'express';
import {createUser,loginUser,logOutUser, registerOwner,registerAdmin, getOwners ,getCurrentUser, updateCurrentUser} from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route("/").post(createUser);
router.route("/auth").post(loginUser);
router.route("/logout").post(logOutUser);
router.post('/register-owner', registerOwner);


router.route('/current-user').get(authenticate, getCurrentUser);
router.route('/current-user/update').put(authenticate, updateCurrentUser);

// Admin Routes
router.route('/register-admin').post(registerAdmin);
router.route('/owners').get(authenticate, authorizeAdmin, getOwners);

export default router;