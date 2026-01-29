import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo">
          <span className="logo-icon">▶</span> Zylar
        </div>
        <button className="login-btn" onClick={() => navigate('/login')}>
          Login
        </button>
      </header>

      <main className="landing-main">
        <section className="hero">
          <h1 className="hero-heading">
            Transform Videos Into Adaptive Streams
          </h1>
          <p className="hero-description">
            Professional HLS transcoding pipeline that converts your videos into multi-quality streams, 
            optimized for seamless playback across all devices and network conditions.
          </p>
        </section>

        <section className="demo-section">
          <div className="demo-card">
            <div className="demo-header">Your Video</div>
            <div className="demo-content">
              <div className="info-row">
                <span className="info-label">FILE</span>
                <span className="info-value">sample-video.mp4</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">SIZE</span>
                <span className="info-value">125 MB</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">DURATION</span>
                <span className="info-value">5:32</span>
              </div>

              <div className="info-row">
                <span className="info-label">FORMAT</span>
                <span className="info-value">H.264 / AAC</span>
              </div>
            </div>
          </div>

          <div className="arrow-separator">→</div>

          <div className="demo-card">
            <div className="demo-header">Your Adaptive Stream</div>
            <div className="demo-content">
              <div className="code-section">
                <div className="code-label">HTML IMPLEMENTATION</div>
                <div className="code-block">
                  <pre>{`<video controls>
  <source 
    src="https://cdn.example.com/master.m3u8" 
    type="application/x-mpegURL"
  />
</video>`}</pre>
                </div>
              </div>

              <div className="divider"></div>

              <div className="code-section">
                <div className="code-label">STREAM OUTPUT</div>
                <div className="code-block">
                  <pre>{`qualities: ["1080p - 5000kbps", "720p - 2800kbps", 
           "480p - 1400kbps", "360p - 800kbps", 
           "240p - 400kbps"]

cdn: CloudFront`}</pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="features-heading">Built for modern video delivery</h2>
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-number">01</div>
              <h3>Upload & Process</h3>
              <p>Drop your video file and our AWS MediaConvert pipeline automatically generates multiple quality variants.</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">02</div>
              <h3>Adaptive Streaming</h3>
              <p>HLS protocol dynamically adjusts video quality based on viewer's bandwidth for buffer-free playback.</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">03</div>
              <h3>Global CDN</h3>
              <p>CloudFront edge locations ensure low-latency delivery to viewers anywhere in the world.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 Zylar. All rights reserved.</p>
      </footer>
    </div>
  );
}
