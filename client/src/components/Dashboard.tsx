import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from './VideoPlayer';

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
  const [user, setUser] = useState<{ email: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos || []);
        if (data.videos?.length > 0 && !selectedVideo) {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${isSidebarOpen ? 'sidebar-open' : ''} ${isCollapsed ? 'collapsed' : ''}`} style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#fff', color: '#000', fontFamily: "'Inter', sans-serif" }}>
      {/* MOBILE TOGGLE */}
      <button 
        className="mobile-nav-toggle"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar-fixed ${isCollapsed ? 'collapsed' : ''}`} style={{ borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: '#fff', zIndex: 100 }}>
        <div className="center-on-collapse" style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div 
            onClick={() => { navigate('/transcode'); setIsSidebarOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem', color: '#4f46e5' }}>▶</span>
            <span className="hide-on-collapse" style={{ fontWeight: 800, fontSize: '1rem' }}>Zylar</span>
          </div>
          <span 
            onClick={() => {
              if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}
            style={{ color: '#000', cursor: 'pointer', fontWeight: 300, fontSize: '1.2rem', padding: '0 0.5rem' }}
          >
            {isCollapsed ? '»' : '«'}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isCollapsed ? '1.5rem 0.5rem' : '1.5rem 1rem' }}>
          <div className="center-on-collapse" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="hide-on-collapse" style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>Projects</h3>
            <button onClick={() => { navigate('/transcode'); setIsSidebarOpen(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
          </div>
          
          {loading ? (
            <div style={{ color: '#999', fontSize: '0.8rem', textAlign: 'center' }}>{isCollapsed ? '...' : 'Loading videos...'}</div>
          ) : videos.length === 0 ? (
            <div className="hide-on-collapse" style={{ color: '#999', fontSize: '0.8rem' }}>No projects yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {videos.map(video => (
                <div 
                  key={video.id} 
                  style={{ 
                    padding: isCollapsed ? '0.75rem 0.25rem' : '1rem', 
                    border: selectedVideo?.id === video.id ? '2px solid #000' : '1px solid #e0e0e0', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    background: '#fff',
                    textAlign: isCollapsed ? 'center' : 'left'
                  }}
                  onClick={() => { setSelectedVideo(video); setIsSidebarOpen(false); }}
                  title={video.originalFileName}
                >
                  {isCollapsed ? (
                    <span style={{ fontSize: '1rem' }}>📄</span>
                  ) : (
                    <>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {video.originalFileName}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#999' }}>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="center-on-collapse" style={{ padding: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <div className="hide-on-collapse" style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#000' }}>
            {user?.email || 'user@example.com'}
          </div>
          <div style={{ display: 'flex' }}>
            <button onClick={handleLogout} style={{ flex: 1, padding: '0.6rem', background: '#fff', border: '1px solid #e0e0e0', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', minWidth: isCollapsed ? '40px' : 'auto' }}>
              {isCollapsed ? '➡' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`main-with-sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafafa', minHeight: '100vh', padding: '2rem' }}>

        {selectedVideo ? (
          <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>{selectedVideo.originalFileName}</h1>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>Created on {new Date(selectedVideo.createdAt).toLocaleDateString()}</p>
            </div>

            <div style={{ background: '#000', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <VideoPlayer key={selectedVideo.id} options={videoJsOptions} />
            </div>

            <div style={{ background: '#fff', padding: '2rem', border: '1px solid #e0e0e0' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.05em' }}>Adaptive Stream URL</h3>
              <div style={{ display: 'flex', border: '1px solid #e0e0e0', padding: '0.25rem', background: '#f9f9f9', marginBottom: '1.5rem' }}>
                <input readOnly value={selectedVideo.cloudfrontUrl} style={{ flex: 1, border: 'none', background: 'none', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }} />
                <button 
                  onClick={() => { navigator.clipboard.writeText(selectedVideo.cloudfrontUrl); alert('Copied!'); }}
                  style={{ background: '#000', color: '#fff', border: 'none', padding: '0 1.5rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  Copy
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Status</h4>
                  <span style={{ padding: '0.25rem 0.75rem', background: '#e1f5fe', color: '#01579b', fontSize: '0.8rem', fontWeight: 700, borderRadius: '4px' }}>{selectedVideo.status}</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.7rem', fontWeight: 800, color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Provider</h4>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>AWS CloudFront</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            {loading ? "Loading your videos..." : "Select a project from the sidebar to view"}
          </div>
        )}
      </main>
    </div>
  );
}
