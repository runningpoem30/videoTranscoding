import { useState, type ChangeEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type Status = 'idle' | 'uploading' | 'transcoding' | 'completed';

interface Video {
  id: string;
  originalFileName: string;
  cloudfrontUrl: string;
  status: string;
  createdAt: string;
}

export default function TranscodingVideo() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [status, setStatus] = useState<Status>('idle');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDFRONT_URL = "https://d3qk5a8a9f1q78.cloudfront.net";
  const BACKEND_URL = "https://bc1opubda1.execute-api.us-east-1.amazonaws.com/upload";

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

    fetchHistory();
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/videos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos || []);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToS3 = async () => {
    if (!file) return;
    setStatus('uploading');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type })
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
        setStatus('transcoding');

        let progress = 0;
        const interval = setInterval(() => {
          progress += 5;
          if (progress >= 100) {
            clearInterval(interval);
            setStatus('completed');
            fetchHistory();
          }
        }, 2000);

        if (token) {
          try {
            await fetch(`${backendUrl}/api/videos`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ originalFileName: file.name, originalFileSize: file.size, cloudfrontUrl: finalHlsUrl, status: 'completed' })
            });
          } catch (saveErr) {
            console.error("Failed to save video metadata:", saveErr);
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus('idle');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: '#fff', color: '#000', fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: '280px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', left: 0, top: 0, background: '#fff' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div 
            onClick={() => navigate('/transcode')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.2rem', color: '#4f46e5' }}>▶</span>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Zylar</span>
          </div>
          <span style={{ color: '#000', cursor: 'pointer', fontWeight: 300, fontSize: '1rem' }}>«</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1.5rem', color: '#000' }}>Projects</h3>
          
          {loadingHistory ? (
            <div style={{ color: '#999', fontSize: '0.8rem' }}>Loading...</div>
          ) : videos.length === 0 ? (
            <div style={{ color: '#999', fontSize: '0.8rem' }}>No projects yet.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {videos.map(video => (
                <div 
                  key={video.id} 
                  style={{ padding: '1rem', border: '1px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', background: '#fff' }}
                  onClick={() => navigate('/dashboard')}
                >
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {video.originalFileName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#999' }}>
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1rem', borderTop: '1px solid #e0e0e0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, marginBottom: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#000' }}>
            {user?.email || 'user@example.com'}
          </div>
          <div style={{ display: 'flex' }}>
            <button 
              onClick={handleLogout}
              style={{ flex: 1, padding: '0.6rem', background: '#fff', border: '1px solid #e0e0e0', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, marginLeft: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: '#000', letterSpacing: '-0.02em' }}>
            What do you want to transcode?
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>
            Upload a video file to generate a high-performance adaptive HLS stream instantly.
          </p>

          <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto', border: '1px solid #e0e0e0', padding: '3rem', background: '#fff' }}>
            {status === 'idle' && (
              <>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ border: '1px solid #e0e0e0', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center', cursor: 'pointer', background: '#f9f9f9', color: file ? '#000' : '#999', fontSize: '0.9rem' }}
                >
                  {file ? file.name : "Choose video file..."}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="video/*" />
                </div>

                <button 
                  onClick={uploadToS3} 
                  disabled={!file}
                  style={{ width: '100%', padding: '1rem', background: '#808080', color: '#fff', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: file ? 'pointer' : 'not-allowed' }}
                >
                  Start Transcoding
                </button>
              </>
            )}

            {status !== 'idle' && (
              <div style={{ textAlign: 'center' }}>
                 <h2 style={{ fontWeight: 800, fontSize: '1.5rem', marginBottom: '2rem', color: '#000' }}>
                   {status === 'uploading' ? "Uploading..." : status === 'transcoding' ? "Transcoding..." : "Success!"}
                 </h2>
                 
                 {status === 'completed' && (
                   <div style={{ textAlign: 'left' }}>
                      <p style={{ fontWeight: 800, fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', marginBottom: '0.5rem' }}>CloudFront Link</p>
                      <div style={{ display: 'flex', border: '1px solid #e0e0e0', padding: '0.25rem', background: '#fff' }}>
                        <input readOnly value={videoUrl} style={{ flex: 1, border: 'none', background: 'none', padding: '0.5rem', fontFamily: 'monospace', fontSize: '0.8rem', color: '#000' }} />
                        <button 
                          onClick={() => { navigator.clipboard.writeText(videoUrl); alert('Copied!'); }} 
                          style={{ background: '#000', color: '#fff', border: 'none', padding: '0.5rem 1rem', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Copy
                        </button>
                      </div>

                      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', borderLeft: '4px solid #f59e0b', fontSize: '0.85rem', color: '#666' }}>
                        <strong>Note:</strong> If the link shows an "Access Denied" error, please wait 1-2 more minutes. AWS is still processing.
                      </div>

                      <button 
                        onClick={() => { setFile(null); setStatus('idle'); }}
                        style={{ marginTop: '2.5rem', width: '100%', padding: '1rem', background: '#fff', border: '1px solid #e0e0e0', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', color: '#000' }}
                      >
                        New Transcode
                      </button>
                   </div>
                 )}

                 {(status === 'uploading' || status === 'transcoding') && (
                   <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #000', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '2rem auto' }} />
                 )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
