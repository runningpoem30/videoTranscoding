import { useState, type ChangeEvent, useRef } from 'react';
import VideoPlayer from './VideoPlayer';
import '../App.css';

export default function TranscodingVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("https://d3qk5a8a9f1q78.cloudfront.net/processed/1769684028851-secondvideowithaud/master.m3u8");
  const [isUploading, setIsUploading] = useState(false);
  const [isTranscoding, setIsTranscoding] = useState(false);
  const playerRef = useRef(null);

  const CLOUDFRONT_URL = "https://d3qk5a8a9f1q78.cloudfront.net";
  const BACKEND_URL = "https://bc1opubda1.execute-api.us-east-1.amazonaws.com/upload";

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const uploadToS3 = async () => {
    if (!file) return alert("Please select a file first!");
    setIsUploading(true);
    setIsTranscoding(false);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      const { uploadUrl, key } = await response.json();

      const s3Response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { "Content-Type": file.type }
      });

      if (s3Response.ok) {
        const fileNameWithTimestamp = key.split('/').pop() || "";
        const folderName = fileNameWithTimestamp.substring(0, fileNameWithTimestamp.lastIndexOf('.'));
        const finalHlsUrl = `${CLOUDFRONT_URL}/processed/${folderName}/master.m3u8`;

        setVideoUrl(finalHlsUrl);
        setIsTranscoding(true);
        alert("Upload successful! The player URL has been updated. Please wait 1-2 minutes for transcoding to finish.");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: videoUrl,
      type: 'application/x-mpegURL'
    }]
  };

  const handlePlayerReady = (player: any) => {
    playerRef.current = player;
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Zylar<span>Transcoder</span></h1>
        <p>Premium HLS Multi-Bitrate Video Pipeline</p>
      </header>

      <main className="content">
        <section className="player-section">
          <div className="player-wrapper shadow-glow">
            <VideoPlayer options={videoJsOptions} onReady={handlePlayerReady} />
          </div>
          <div className="video-info">
            <h3>Playback: {videoUrl.split('/').pop()}</h3>
            <input
              type="text"
              placeholder="Paste HLS Master Playlist URL..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="url-input"
            />
          </div>
        </section>

        <section className="upload-section">
          <div className="upload-card shadow-glow">
            <h2>Ready to Transcode?</h2>
            <p>Upload your RAW video to trigger the 5-quality ABR pipeline.</p>

            <div className="file-input-wrapper">
              <input type="file" id="file-upload" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="file-label">
                {file ? file.name : "Choose Video File"}
              </label>
            </div>

            <button
              className={`upload-button ${isUploading ? 'loading' : ''}`}
              onClick={uploadToS3}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload & Transcode"}
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Zylar Space Dev. All rights reserved.</p>
      </footer>
    </div>
  );
}
