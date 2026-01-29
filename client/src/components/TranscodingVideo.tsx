import { useState, type ChangeEvent, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

type Status = 'idle' | 'uploading' | 'transcoding' | 'completed';

export default function TranscodingVideo() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [status, setStatus] = useState<Status>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CLOUDFRONT_URL = "https://d3qk5a8a9f1q78.cloudfront.net";
  const BACKEND_URL = "https://bc1opubda1.execute-api.us-east-1.amazonaws.com/upload";

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToS3 = async () => {
    if (!file) return;
    setStatus('uploading');

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
        setStatus('transcoding');

        // Save to backend
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            await fetch(`${backendUrl}/api/videos`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                originalFileName: file.name,
                originalFileSize: file.size,
                cloudfrontUrl: finalHlsUrl,
                status: 'completed'
              })
            });
          } catch (saveErr) {
            console.error("Failed to save video metadata:", saveErr);
          }
        }

        // Mock transcoding time - in real app, we might poll an API
        // For now, we show "transcoding" for a bit then "completed"
        setTimeout(() => {
          setStatus('completed');
        }, 3000);
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. please check your connection.");
      setStatus('idle');
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(videoUrl);
    alert('Copied to clipboard!');
  };

  return (
    <div className="landing-container" style={{ justifyContent: 'center' }}>
      <main className="landing-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 className="hero-heading" style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 700 }}>
            What do you want to transcode?
          </h1>
          <p className="hero-description" style={{ fontSize: '1.1rem', color: '#666' }}>
            Upload a video file to generate an adaptive HLS stream.
          </p>
        </div>

        <div className="auth-box" style={{ width: '100%', maxWidth: '600px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', padding: '2.5rem' }}>
          {status === 'idle' && (
            <>
              <div 
                className="form-group" 
                onClick={() => fileInputRef.current?.click()}
                style={{ marginBottom: '2rem', cursor: 'pointer' }}
              >
                <div style={{ 
                  border: '1px solid #d0d0d0', 
                  padding: '1.25rem', 
                  borderRadius: '4px', 
                  color: file ? '#1a1a1a' : '#999',
                  background: '#fff',
                  fontSize: '1rem',
                  textAlign: 'center'
                }}>
                  {file ? file.name : "Choose video file..."}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  style={{ display: 'none' }} 
                  accept="video/*"
                />
              </div>

              <button 
                className="submit-btn" 
                onClick={uploadToS3} 
                disabled={!file}
                style={{ height: '54px', fontSize: '1rem' }}
              >
                Start Transcoding
              </button>
            </>
          )}

          {status !== 'idle' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ marginBottom: '2rem' }}>
                {status === 'uploading' && (
                  <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '1.2rem' }}>
                    Uploading your video...
                  </div>
                )}
                {status === 'transcoding' && (
                  <div style={{ color: '#4f46e5', fontWeight: 600, fontSize: '1.2rem' }}>
                    Transcoding your video...
                    <p style={{ fontWeight: 400, fontSize: '0.9rem', color: '#666', marginTop: '0.5rem' }}>
                      This usually takes 1-2 minutes.
                    </p>
                  </div>
                )}
                {status === 'completed' && (
                  <div style={{ color: '#059669', fontWeight: 600, fontSize: '1.2rem' }}>
                    Transcoding Successful!
                  </div>
                )}
              </div>

              {status === 'completed' && (
                <div style={{ textAlign: 'left', marginTop: '2rem' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem', color: '#1a1a1a' }}>
                    HERE'S YOUR CLOUDFRONT LINK
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.5rem', 
                    background: '#f5f5f5', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <input 
                      readOnly 
                      value={videoUrl} 
                      style={{ 
                        flex: 1, 
                        background: 'none', 
                        border: 'none', 
                        padding: '0.5rem', 
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }} 
                    />
                    <button 
                      onClick={copyUrl}
                      style={{ 
                        background: '#1a1a1a', 
                        color: 'white', 
                        border: 'none', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}
                    >
                      Copy
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                    <button 
                      className="submit-btn" 
                      onClick={() => {
                        setFile(null);
                        setStatus('idle');
                      }}
                      style={{ flex: 1, background: '#fff', color: '#1a1a1a', border: '1px solid #d0d0d0' }}
                    >
                      New Transcode
                    </button>
                    <button 
                      className="submit-btn" 
                      onClick={() => navigate('/dashboard')}
                      style={{ flex: 1 }}
                    >
                      View History
                    </button>
                  </div>
                </div>
              )}

              {(status === 'uploading' || status === 'transcoding') && (
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '3px solid #f3f3f3', 
                  borderTop: '3px solid #1a1a1a', 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  margin: '2rem auto'
                }} />
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="landing-footer">
        <p>© 2026 Zylar. All rights reserved.</p>
      </footer>
    </div>
  );
}
