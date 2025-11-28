require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

// Import Model
const User = require('./models/User');

const app = express();

// Middleware
app.use(cors()); // Allows Frontend to talk to Backend
app.use(express.json()); // Parses incoming JSON requests

// Configuration
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const PORT = process.env.PORT || 5000;
const ALLOWED_DOMAIN = process.env.COLLEGE_DOMAIN || 'college.edu';

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));


// --- AUTHENTICATION ROUTE ---
app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body;

  // 1. Basic Validation
  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    // 2. Verify Token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, sub: googleId, picture } = payload;

    // 🛑 3. STRICT DOMAIN CHECK (The Challenge Requirement) 🛑
    // This ensures only institutional emails can log in
    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      console.log(`🚫 Login blocked for: ${email} (Wrong Domain)`);
      return res.status(403).json({ 
        error: "Access Restricted",
        message: `Only official @${ALLOWED_DOMAIN} email IDs are allowed.` 
      });
    }

    // 4. Check if User Exists in DB
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        picture,
        role: 'student' // Default role
      });
      console.log(`🆕 New User Created: ${email}`);
    }

    // 5. Check Ban Status
    if (user.isBanned) {
        console.log(`⛔ Banned user tried to login: ${email}`);
        return res.status(403).json({ 
            error: "Account Suspended",
            message: "Your account has been suspended for violating community guidelines." 
        });
    }

    // 6. Generate Session Token (JWT)
    // The frontend will send this token in headers for future requests
    const sessionToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 7. Send Success Response
    res.status(200).json({
      message: "Login successful",
      token: sessionToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture
      }
    });

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

// --- PROTECTED ROUTE EXAMPLE (For Testing) ---
// This middleware checks if the user has a valid JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token) return res.status(403).json({message: "No token provided"});

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if(err) return res.status(401).json({message: "Unauthorized"});
        req.user = decoded;
        next();
    });
};

app.get('/api/dashboard', verifyToken, (req, res) => {
    res.json({ message: `Welcome to the dashboard, User ID: ${req.user.id}` });
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔒 Restricting access to domain: @${ALLOWED_DOMAIN}`);
});