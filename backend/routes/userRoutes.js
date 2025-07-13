import express from 'express';
import {createUser,loginUser,logOutUser, registerOwner,registerAdmin, getOwners ,getCurrentUser} from '../controllers/userController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route("/").post(createUser);
router.route("/auth").get(loginUser);
router.route("/logout").post(logOutUser);
router.post('/register-owner', registerOwner);


router.route('/current-user').get(authenticate, getCurrentUser);


// Admin Routes
router.route('/register-admin').post(registerAdmin);
router.route('/owners').get(authenticate, authorizeAdmin, getOwners);

export default router;