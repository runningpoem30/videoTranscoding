import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';
import '../App.css';

interface Video {
  id: string;
  originalFileName: string;
  cloudfrontUrl: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/videos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos);
        if (data.videos.length > 0 && !selectedVideo) {
          setSelectedVideo(data.videos[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const videoJsOptions = selectedVideo ? {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: selectedVideo.cloudfrontUrl,
      type: 'application/x-mpegURL'
    }]
  } : null;

  return (
    <div className="dashboard-container">
      <header className="landing-header">
        <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <span className="logo-icon">▶</span> Zylar
        </div>
        <div className="header-actions">
          <button className="secondary-cta" onClick={() => navigate('/transcode')}>New Transcode</button>
          <button className="login-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="videos-sidebar">
            <h2 className="section-title">My Videos</h2>
            {loading ? (
              <p>Loading videos...</p>
            ) : videos.length === 0 ? (
              <div className="empty-state">
                <p>No videos transcoded yet.</p>
                <button className="primary-cta" onClick={() => navigate('/transcode')}>Start Transcoding</button>
              </div>
            ) : (
              <div className="video-list">
                {videos.map(video => (
                  <div 
                    key={video.id} 
                    className={`video-item ${selectedVideo?.id === video.id ? 'active' : ''}`}
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="video-item-info">
                      <span className="video-name">{video.originalFileName}</span>
                      <span className="video-date">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="video-preview-section">
            {selectedVideo ? (
              <div className="preview-container">
                <div className="player-wrapper shadow-glow" style={{borderRadius: '4px', overflow: 'hidden', background: '#000'}}>
                  <VideoPlayer key={selectedVideo.id} options={videoJsOptions} />
                </div>
                <div className="video-details-card">
                  <h3>Stream Details</h3>
                  <div className="detail-row">
                    <span className="detail-label">Filename</span>
                    <span className="detail-value">{selectedVideo.originalFileName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status</span>
                    <span className="detail-value status-badge">{selectedVideo.status}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">HLS Master Playlist</span>
                    <div className="url-copy-box">
                      <input readOnly value={selectedVideo.cloudfrontUrl} className="url-mini-input" />
                      <button 
                        className="copy-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedVideo.cloudfrontUrl);
                          alert('URL copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-selection shadow-glow">
                <p>Select a video from the list to preview</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="landing-footer">
        <p>© 2026 Zylar. All rights reserved.</p>
      </footer>
    </div>
  );
}
