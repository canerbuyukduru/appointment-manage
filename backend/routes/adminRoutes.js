// routes/adminRoutes.js
import express from 'express';
import {
  getAdminStats,
  getPendingOwners,
  getAllOwners,
  getOwnerDetails,
  approveOwner,
  rejectOwner,
  getAllUsers,
  toggleUserBan,
  getAllBeautyCenters,
  toggleBeautyCenterStatus,
  loginAdmin
} from '../controllers/adminController.js';
import { authenticate,authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// login 
router.post('/login', loginAdmin);

// Tüm admin route'ları authenticate ve authorize gerektirir
router.use(authenticate);
router.use(authorizeAdmin); 

// Dashboard & Statistics
router.get('/stats', getAdminStats);

// Owner Management Routes
router.get('/owners/pending', getPendingOwners);           // Bekleyen owner'lar
router.get('/owners/:id', getOwnerDetails);               // Owner detayları
router.get('/owners', getAllOwners);                      // Tüm owner'lar (filtreleme ile)
router.patch('/owners/:id/approve', approveOwner);        // Owner onayla
router.patch('/owners/:id/reject', rejectOwner);          // Owner reddet

// User Management Routes  
router.get('/users', getAllUsers);                        // Tüm kullanıcılar
router.patch('/users/:id/ban', toggleUserBan);            // Kullanıcı ban/unban

// Beauty Center Management Routes
router.get('/beauty-centers', getAllBeautyCenters);       // Tüm merkezler
router.patch('/beauty-centers/:id/toggle-status', toggleBeautyCenterStatus); // Merkez suspend/activate

export default router;