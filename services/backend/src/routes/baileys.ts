import express from "express";
import { 
  getQRCodeHandler, 
  forceResetHandler,
  getConnectionStatusHandler 
} from "../controllers/baileys.js";
import { validateToken, adminOnly } from '../middlewares/auth.js';

const router = express.Router();

// Get QR code for WhatsApp connection
router.get("/qr-code", validateToken, adminOnly, getQRCodeHandler);

// Force reset connection and generate new QR code
router.post("/reset", validateToken, adminOnly, forceResetHandler);

// Get connection status
router.get("/status", validateToken, adminOnly, getConnectionStatusHandler);

export default router;