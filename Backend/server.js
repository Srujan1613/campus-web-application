require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- MODELS ---
const UserSchema = new mongoose.Schema({
  name: String, 
  email: { type: String, unique: true }, 
  googleId: String, 
  picture: String,
  role: { type: String, enum: ['student', 'admin', 'alumni'], default: 'student' },
  isBanned: { type: Boolean, default: false }, // <--- The Ban Flag
  company: { type: String, default: "Not Specified" },
  position: { type: String, default: "Alumnus" },
  linkedin: { type: String, default: "" },
  joinedAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

const LectureSchema = new mongoose.Schema({
  title: String, videoUrl: String, transcript: String, timeline: String, uploadedAt: { type: Date, default: Date.now }
});
const Lecture = mongoose.model('Lecture', LectureSchema);

// --- CONFIG ---
const app = express();
const PORT = process.env.PORT || 8080;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ALLOWED_DOMAIN = process.env.COLLEGE_DOMAIN || 'mlrit.ac.in';

app.use(cors());
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- REST ROUTES ---

// 1. AUTH (Login)
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { name, email, sub: googleId, picture } = ticket.getPayload();
    
    // Domain Check
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        return res.status(403).json({ message: `Only @${ALLOWED_DOMAIN} allowed` });
    }

    let user = await User.findOne({ email });
    if (!user) user = await User.create({ name, email, googleId, picture });
    
    if (user.isBanned) return res.status(403).json({ message: "Account Suspended by Admin" });

    res.json({ token: "session_token", user }); // Returns User with _id
  } catch (e) { res.status(401).json({ message: "Auth Failed" }); }
});

// 2. LECTURES
app.get('/api/lectures', async (req, res) => res.json(await Lecture.find().sort({ uploadedAt: -1 })));

app.post('/api/lectures', async (req, res) => {
  const { title, videoUrl, timeline } = req.body;
  const tempPath = path.join(__dirname, `temp_${Date.now()}.mp4`);
  
  try {
    console.log("🎙️ Downloading video...");
    const writer = fs.createWriteStream(tempPath);
    const response = await axios({ url: videoUrl, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });

    console.log("🤖 Generating Transcript...");
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath), model: "whisper-1", response_format: "text",
    });

    const newLecture = await Lecture.create({ title, videoUrl, transcript: transcription, timeline });
    fs.unlinkSync(tempPath);
    res.json(newLecture);
  } catch (e) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    // Fallback save
    const fallback = await Lecture.create({ title, videoUrl, timeline, transcript: "Transcript Unavailable" });
    res.json(fallback);
  }
});

// 3. ADMIN ROUTES (For the Dashboard)
app.get('/api/admin/stats', async (req, res) => {
    const totalUsers = await User.countDocuments();
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalLectures = await Lecture.countDocuments();
    const alumniCount = await User.countDocuments({ role: 'alumni' });
    res.json({ totalUsers, bannedUsers, totalLectures, alumniCount });
});

app.get('/api/admin/banned', async (req, res) => res.json(await User.find({ isBanned: true })));

app.post('/api/admin/unban/:id', async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { isBanned: false });
    res.json({ success: true });
});

app.get('/api/admin/users', async (req, res) => res.json(await User.find().sort({ joinedAt: -1 })));

// 4. ALUMNI
app.get('/api/users/alumni', async (req, res) => res.json(await User.find({ role: 'alumni' })));
app.put('/api/users/profile', async (req, res) => {
  const { userId, ...updates } = req.body;
  res.json(await User.findByIdAndUpdate(userId, updates, { new: true }));
});

// --- SOCKET.IO (CHAT + AI MODERATION) ---
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  socket.on('join_room', (room) => socket.join(room));
  
  socket.on('send_message', async (data) => {
    try {
      // 1. AI Content Check
      const mod = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Is this text vulgar, bullying, or offensive? Reply strictly YES or NO." },
          { role: "user", content: data.message }
        ],
        max_tokens: 5
      });
      
      const verdict = mod.choices[0].message.content.toUpperCase();
      console.log(`🤖 AI Verdict: ${verdict} for "${data.message}"`);
      
      if (verdict.includes("YES")) {
        console.log(`🚫 BANNING USER: ${data.userId}`);
        
        // 2. CRITICAL: Update Database
        await User.findByIdAndUpdate(data.userId, { isBanned: true });
        
        // 3. Notify User
        io.to(socket.id).emit('ban_notice', "Suspended for inappropriate language.");
      } else {
        // Safe message
        io.to(data.room).emit('receive_message', data);
      }
    } catch (e) { 
      console.error("Socket Error:", e);
      io.to(data.room).emit('receive_message', data); // Allow if AI fails
    }
  });
});

server.listen(PORT, () => console.log(`🚀 Server running on ${PORT}`));