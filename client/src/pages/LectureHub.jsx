import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactPlayer from "react-player";
import { useNavigate } from "react-router-dom";

const LectureHub = () => {
  const navigate = useNavigate();
  const playerRef = useRef(null); // Reference to control the video player

  const [lectures, setLectures] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Lectures on Load
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/lectures");
        setLectures(res.data);
        if (res.data.length > 0) {
          setActiveVideo(res.data[0]); // Auto-play the newest video
        }
      } catch (err) {
        console.error("Error fetching lectures:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLectures();
  }, []);

  // 2. Helper: Parse Timeline String (e.g., "00:00 Intro") into Objects
  const parseTimeline = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => {
        const parts = line.trim().split(" ");
        if (parts.length < 2) return null; // Skip invalid lines

        const timeStr = parts[0]; // "02:30"
        const label = parts.slice(1).join(" "); // "Math Logic"

        // Convert "MM:SS" to seconds
        const timeParts = timeStr.split(":");
        if (timeParts.length !== 2) return null;

        const seconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]);

        return { timeStr, seconds, label };
      })
      .filter((item) => item !== null);
  };

  // 3. Handler: Jump to specific time
  const handleSeek = (seconds) => {
    if (playerRef.current) {
      playerRef.current.currentTime = seconds; // Set the time
      playerRef.current.play(); // Ensure it plays immediately
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      {/* --- NAVBAR --- */}
      <div className="bg-white shadow p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-xl font-bold text-blue-900">Lecture Hub</h1>
        </div>
        <button
          onClick={() => navigate("/upload")}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition shadow-sm"
        >
          + Upload Lecture
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- LEFT: PLAYER AREA --- */}
        <div className="w-full md:w-3/4 p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              Loading Content...
            </div>
          ) : activeVideo ? (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* VIDEO PLAYER WRAPPER */}
              <div className="relative pt-[56.25%] bg-black group">
                {/* <ReactPlayer
                  ref={playerRef}
                  url={activeVideo.videoUrl}
                  className="absolute top-0 left-0"
                  width="100%"
                  height="100%"
                  controls={true}
                  playing={true}
                  muted={true} // 👈 ADD THIS. It forces the video to start muted.
                /> */}

                <video
                  ref={playerRef} // 👈 THIS IS CRITICAL
                  src={activeVideo.videoUrl}
                  className="absolute top-0 left-0 w-full h-full object-contain"
                  controls
                  autoPlay={false}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* TIMELINE / TOPICS BAR */}
              {activeVideo.timeline && (
                <div className="bg-blue-50 border-b border-blue-100 p-4">
                  <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Jump to Topic
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {parseTimeline(activeVideo.timeline).map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSeek(item.seconds)}
                        className="flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                      >
                        <span className="font-bold opacity-75">
                          {item.timeStr}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* METADATA & TRANSCRIPT */}
              <div className="p-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {activeVideo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 border-b pb-6">
                  <span>
                    📅 {new Date(activeVideo.uploadedAt).toLocaleDateString()}
                  </span>
                  <span>🎥 Lecture Video</span>
                </div>

                {/* Transcript Box */}
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider">
                      🤖 AI Transcript
                    </h3>
                  </div>
                  <div className="p-6 h-64 overflow-y-auto text-gray-600 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                    {activeVideo.transcript ? (
                      activeVideo.transcript
                    ) : (
                      <span className="text-gray-400 italic">
                        No transcript available for this lecture.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400 border-2 border-dashed rounded-xl">
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 10l4.553-2.276A1 1 0 0121 8.818v6.364a1 1 0 01-.996 1.09l-4.553-2.276"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                ></path>
              </svg>
              <p>Select a lecture from the sidebar to start watching</p>
            </div>
          )}
        </div>

        {/* --- RIGHT: SIDEBAR PLAYLIST --- */}
        <div className="hidden md:block w-1/4 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 font-bold text-gray-700 flex justify-between items-center">
            <span>Course Content</span>
            <span className="bg-gray-200 text-gray-600 text-xs py-1 px-2 rounded-full">
              {lectures.length}
            </span>
          </div>
          <ul className="divide-y divide-gray-100">
            {lectures.map((vid) => (
              <li
                key={vid._id}
                onClick={() => setActiveVideo(vid)}
                className={`p-4 cursor-pointer transition-all hover:bg-blue-50 group ${
                  activeVideo?._id === vid._id
                    ? "bg-blue-50 border-l-4 border-blue-600"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">
                    ▶
                  </div>
                  <div>
                    <div
                      className={`font-medium text-sm line-clamp-2 ${
                        activeVideo?._id === vid._id
                          ? "text-blue-700"
                          : "text-gray-800"
                      }`}
                    >
                      {vid.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(vid.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LectureHub;
