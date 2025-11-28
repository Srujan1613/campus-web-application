require("dotenv").config();
const express = require("express");
const http = require("http"); // Needed for Socket.io
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const { OAuth2Client } = require("google-auth-library");
const OpenAI = require("openai");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// --- IMPORT MODELS ---
const User = require("./models/User");
const Lecture = require("./models/Lecture");
// const Chat = require('./models/Chat'); // Uncomment if you created the Chat model

// --- CONFIGURATION ---
const app = express();
const PORT = process.env.PORT || 8080;
const ALLOWED_DOMAIN = process.env.COLLEGE_DOMAIN || "mlrit.ac.in"; // Restriction

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Third-Party Clients
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- MONGODB CONNECTION ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ==========================================
// 🔐 1. AUTHENTICATION ROUTE
// ==========================================
app.post("/api/auth/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, picture } = ticket.getPayload();

    // A. DOMAIN RESTRICTION CHECK
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return res.status(403).json({
        error: "Access Denied",
        message: `Only official @${ALLOWED_DOMAIN} email IDs are allowed.`,
      });
    }

    // B. FIND OR CREATE USER
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        picture,
        role: "student",
      });
      console.log(`🆕 New User: ${email}`);
    }

    // C. BAN CHECK
    if (user.isBanned) {
      return res.status(403).json({
        error: "Suspended",
        message: "Your account has been suspended by the admin.",
      });
    }

    // D. RETURN SESSION DATA
    res.status(200).json({
      message: "Login successful",
      token: "mock-jwt-token-for-hackathon", // In production, sign a real JWT here
      user: user,
    });
  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid Token" });
  }
});

// ==========================================
// 🎥 2. LECTURE ROUTES (Auto-Transcript)
// ==========================================

// GET: Fetch all lectures
app.get("/api/lectures", async (req, res) => {
  try {
    const lectures = await Lecture.find().sort({ uploadedAt: -1 });
    res.json(lectures);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lectures" });
  }
});

// POST: Upload URL & Generate Transcript
app.post("/api/lectures", async (req, res) => {
  const { title, videoUrl, timeline } = req.body;

  if (!title || !videoUrl) {
    return res.status(400).json({ error: "Title and Video URL required" });
  }

  console.log(`🎙️ Processing Video: ${title}`);

  // Create a unique temp file name
  const tempFilePath = path.join(__dirname, `temp_${Date.now()}.mp4`);

  try {
    // A. DOWNLOAD VIDEO FROM CLOUD
    const writer = fs.createWriteStream(tempFilePath);
    const response = await axios({
      url: videoUrl,
      method: "GET",
      responseType: "stream",
    });
    response.data.pipe(writer);

    // Wait for download
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("✅ Downloaded. Sending to OpenAI Whisper...");

    // B. SEND TO OPENAI
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      response_format: "text",
    });

    console.log("✅ Transcript Generated!");

    // C. SAVE TO DB
    const newLecture = await Lecture.create({
      title,
      videoUrl,
      transcript: transcription,
      timeline: timeline || "", // Save the timeline
    });

    // Cleanup
    fs.unlinkSync(tempFilePath);
    res.status(201).json(newLecture);
  } catch (error) {
    console.error("❌ Processing Failed:", error.message);
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Fallback: Save without transcript
    const fallback = await Lecture.create({
      title,
      videoUrl,
      transcript: "Transcript unavailable.",
    });
    res
      .status(201)
      .json({
        ...fallback._doc,
        warning: "Transcript failed (File likely too large).",
      });
  }
});

// ==========================================
// 💬 3. REAL-TIME CHAT & AI MODERATION
// ==========================================
const server = http.createServer(app); // Wrap Express
const io = new Server(server, {
  cors: { origin: "*" }, // Allow frontend access
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("join_room", (room) => socket.join(room));

  socket.on("send_message", async (data) => {
    const { message, room, userId } = data;

    // A. AI MODERATION CHECK
    try {
      const modCheck = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Is this text vulgar, bullying, or offensive? Reply strictly 'YES' or 'NO'.",
          },
          { role: "user", content: message },
        ],
        max_tokens: 5,
      });

      const isBad = modCheck.choices[0].message.content
        .toUpperCase()
        .includes("YES");

      if (isBad) {
        // Ban User Logic
        await User.findByIdAndUpdate(userId, { isBanned: true });
        // Kick User
        io.to(socket.id).emit(
          "ban_notice",
          "Suspended for inappropriate language."
        );
        return;
      }

      // If clean, broadcast
      io.to(room).emit("receive_message", data);
    } catch (err) {
      console.error("AI Mod Error:", err);
      io.to(room).emit("receive_message", data); // Allow message if AI fails
    }
  });
});

// ==========================================
// 🚀 START SERVER
// ==========================================
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Restricting access to: @${ALLOWED_DOMAIN}`);
});
