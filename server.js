import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// API Route
app.post("/api/sos", async (req, res) => {
  const data = req.body;

  try {
    // Setup transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });

    let locationText = "Location unavailable.";
    if (data.coords) {
      locationText = `Latitude: ${data.coords.lat}, Longitude: ${data.coords.lon}, Accuracy: ${data.coords.accuracy}m\n` +
                     `Google Maps: https://www.google.com/maps?q=${data.coords.lat},${data.coords.lon}`;
    } else if (data.geoError) {
      locationText = `Location unavailable. Error: ${data.geoError}`;
    }

    // Mail content
    const mailOptions = {
      from: `"Disaster SOS" <${process.env.GMAIL_USER}>`,
      to: "sosteam@gmail.com",
      subject: "🚨 SOS Alert Received",
      text: `🚨 SOS ALERT 🚨\n\nReason: ${data.reason}\nTimestamp: ${data.timestamp}\n\n${locationText}`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "SOS sent to Gmail" });
  } catch (err) {
    console.error("Mail error:", err);
    res.status(500).json({ success: false, error: "Failed to send SOS" });
  }
});

// Fallback → serve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
