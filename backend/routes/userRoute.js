import express from 'express';
import {createUser,loginUser,logOutUser} from '../controllers/userController.js';
const router = express.Router();

router.route("/").post(createUser);
router.route("/auth").get(loginUser);
router.route("/logout").post(logOutUser);


export default router;