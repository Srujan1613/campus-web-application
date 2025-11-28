const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  videoUrl: { 
    type: String, 
    required: true 
  },
  transcript: { 
    type: String, 
    default: "" 
  },
  timeline: { 
    type: String, 
    default: "" 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Lecture', LectureSchema);