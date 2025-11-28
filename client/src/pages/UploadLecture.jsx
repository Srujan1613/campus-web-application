import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadLecture = () => {
  const navigate = useNavigate();

  // State for form fields
  const [file, setFile] = useState(null);
  const [timeline, setTimeline] = useState("");
  const [title, setTitle] = useState("");
  // REMOVED: const [transcript, setTranscript] ... (AI handles this now)

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a video file!");

    setLoading(true);
    setStatus("⏳ Uploading Video to Cloud...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "campus_upload");
    formData.append("resource_type", "video");

    try {
      // 1. Upload to Cloudinary
      // Make sure 'dcabrggvf' is your actual Cloud Name
      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/dcabrggvf/video/upload`,
        formData
      );

      const videoUrl = cloudRes.data.secure_url;
      console.log("Cloudinary URL:", videoUrl);

      // 2. Send to Backend for AI Processing
      setStatus("🤖 AI is generating transcript... (This takes ~30 seconds)");

      // We only send Title and URL. Backend downloads video -> sends to OpenAI -> saves DB.
      await axios.post("http://localhost:8080/api/lectures", {
        title: title,
        videoUrl: videoUrl,
        timeline: timeline, // Optional
      });

      alert("✅ Published! Transcript generated successfully.");
      navigate("/lectures");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong during upload or AI processing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Upload New Lecture
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecture Title
            </label>
            <input
              type="text"
              required
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Introduction to Data Science"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Video File */}
          <div className="border-2 border-dashed border-blue-200 bg-blue-50 p-6 rounded-lg text-center">
            <input
              type="file"
              accept="video/*"
              required
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p className="text-xs text-gray-400 mt-2">
              Supported: MP4, WebM. <br />
              <span className="text-red-500 font-bold">
                Max size: 25MB (for AI Demo)
              </span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timeline (Format: 00:00 Topic)
            </label>
            <textarea
              className="w-full p-2 border rounded h-20"
              placeholder="00:00 Introduction&#10;02:30 Math Logic&#10;05:45 Conclusion"
              onChange={(e) => setTimeline(e.target.value)}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-bold rounded-lg transition-all ${
              loading
                ? "bg-gray-400 cursor-not-allowed animate-pulse"
                : "bg-blue-600 hover:bg-blue-700 shadow-lg"
            }`}
          >
            {loading ? status : "Publish & Generate AI Transcript"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadLecture;
