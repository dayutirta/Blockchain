import { Request, Response } from "express";
import { 
  qrCode, 
  isConnected, 
  forceResetConnection,
  getConnectionStatus 
} from "../services/baileys.js";

export const getQRCodeHandler = async (req: Request, res: Response) => {
  try {
    const status = getConnectionStatus();
    
    if (status.isConnected) {
      return res.status(200).json({ 
        status: "CONNECTED", 
        message: "WhatsApp sudah terhubung" 
      });
    } 
    
    if (status.hasQR && status.qrCode) {
      return res.status(200).json({ 
        status: "QR_READY", 
        qr: status.qrCode,
        message: "Scan QR code untuk menghubungkan WhatsApp" 
      });
    }
    
    return res.status(202).json({
      status: "WAITING",
      message: "Menunggu QR code, coba lagi dalam beberapa detik...",
    });
  } catch (error) {
    console.error("Error in getQRCodeHandler:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Internal server error",
    });
  }
};

export const forceResetHandler = async (req: Request, res: Response) => {
  try {
    await forceResetConnection();
    
    return res.status(200).json({
      status: "SUCCESS",
      message: "Koneksi direset. QR code baru akan dibuat dalam beberapa detik."
    });
  } catch (error) {
    console.error("Error in forceResetHandler:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Gagal mereset koneksi",
    });
  }
};

export const getConnectionStatusHandler = async (req: Request, res: Response) => {
  try {
    const status = getConnectionStatus();
    
    return res.status(200).json({
      status: "SUCCESS",
      data: {
        isConnected: status.isConnected,
        hasQR: status.hasQR
      }
    });
  } catch (error) {
    console.error("Error in getConnectionStatusHandler:", error);
    return res.status(500).json({
      status: "ERROR",
      message: "Gagal mendapatkan status koneksi",
    });
  }
};