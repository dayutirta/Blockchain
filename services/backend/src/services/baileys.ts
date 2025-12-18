import { 
  makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion 
} from "@whiskeysockets/baileys";
import fs from "fs";
import qrcode from "qrcode-terminal";

let sock: any;
export let qrCode: string | null = null;
export let isConnected: boolean = false;

const AUTH_DIR = "./auth_baileys";

const startSock = async () => {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      printQRInTerminal: true,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      connectTimeoutMs: 60000,
    });

    sock.ev.on("connection.update", async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        qrCode = qr;
        console.log("QR Code generated, scan to connect.");
      }

      if (connection === "close") {
        isConnected = false;
        qrCode = null;
        
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log("Connection closed. Status code:", statusCode);
        console.log("Should reconnect:", shouldReconnect);

        if (statusCode === DisconnectReason.loggedOut) {
          console.log("Device logged out. Resetting auth state...");
          await resetAuthState();
        }

        if (shouldReconnect) {
          console.log("Reconnecting in 5 seconds...");
          setTimeout(() => startSock(), 5000);
        } else {
          console.log("Logged out. Please restart the service to generate new QR code.");
        }
      } else if (connection === "open") {
        isConnected = true;
        qrCode = null;
        console.log("✅ WhatsApp connection established successfully.");
      }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m: any) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && m.type === "notify") {
        console.log("Sender Number:", msg.key.remoteJid);
        console.log("Message:", msg.message?.conversation || "Non-text message");
      }
    });

  } catch (error) {
    console.error("Error starting socket:", error);
    setTimeout(() => startSock(), 5000);
  }
};

const resetAuthState = async () => {
  try {
    if (fs.existsSync(AUTH_DIR)) {
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      console.log("✅ Auth state reset successfully.");
    } else {
      console.warn("⚠️ Auth state directory does not exist.");
    }
  } catch (error) {
    console.error("❌ Failed to reset auth state:", error);
  }
};

export const forceResetConnection = async () => {
  console.log("🔄 Force resetting connection...");
  
  if (sock) {
    try {
      await sock.logout();
    } catch (error) {
      console.log("Logout error (ignored):", error);
    }
  }
  
  await resetAuthState();
  isConnected = false;
  qrCode = null;
  
  console.log("⏳ Restarting socket in 2 seconds...");
  setTimeout(() => startSock(), 2000);
};

export const sendTextWA = async (number: string, message: string) => {
  const formattedNumber = number.includes("@") 
    ? number 
    : `${number}@s.whatsapp.net`;
  
  try {
    if (!isConnected) {
      throw new Error("WhatsApp is not connected.");
    }

    if (!sock) {
      throw new Error("Socket not initialized.");
    }

    await sock.sendMessage(formattedNumber, { text: message });
    console.log(`✅ Message sent to ${number}`);
    return { success: true };
  } catch (error) {
    console.error("❌ Failed to send message:", error);
    throw error;
  }
};

export const getConnectionStatus = () => {
  return {
    isConnected,
    hasQR: !!qrCode,
    qrCode: qrCode
  };
};

// Start the socket when module loads
startSock();