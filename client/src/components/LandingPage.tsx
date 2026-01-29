import { useNavigate } from 'react-router-dom';
import '../App.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1 className="hero-title">
          Experience the Future of <span className="gradient-text">Video Transcoding</span>
        </h1>
        <p className="hero-subtitle">
          Scale your video delivery with our high-performance, multi-bitrate HLS pipeline. 
          Seamlessly transcode RAW videos into 5 optimized qualities for any device.
        </p>
        <div className="cta-group">
          <button 
            className="primary-cta shadow-glow" 
            onClick={() => navigate('/transcode')}
          >
            Get Started
          </button>
          <button className="secondary-cta">
            View Features
          </button>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card shadow-glow">
          <div className="feature-icon">🚀</div>
          <h3>Ultra Fast</h3>
          <p>Powered by AWS MediaConvert for lightning quick processing.</p>
        </div>
        <div className="feature-card shadow-glow">
          <div className="feature-icon">📱</div>
          <h3>Multi-Device</h3>
          <p>Adaptive Bitrate (ABR) ensures smooth playback on any screen.</p>
        </div>
        <div className="feature-card shadow-glow">
          <div className="feature-icon">🛡️</div>
          <h3>Secure</h3>
          <p>End-to-end encryption and secure S3 storage for your assets.</p>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2026 zylar.space . All rights reserved.</p>
      </footer>
    </div>
  );
}
