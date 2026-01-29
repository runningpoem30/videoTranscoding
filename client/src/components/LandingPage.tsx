import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import '../App.css';

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    unit: '/mo',
    features: ['500 MB Storage', 'Standard Transcoding', 'Community Support'],
    buttonText: 'Get Started',
    popular: false,
  },
  {
    name: 'Hobby',
    price: '$15',
    unit: '/mo',
    features: ['10 GB Storage', 'Priority Transcoding', 'Email Support'],
    buttonText: 'Get Started',
    popular: false,
    soon: true,
  },
  {
    name: 'Pro',
    price: '$49',
    unit: '/mo',
    features: ['100 GB Storage', 'Instant Transcoding', '24/7 Priority Support', 'Custom Domains'],
    buttonText: 'Get Started',
    popular: true,
    soon: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    unit: '',
    features: ['Unlimited Storage', 'Dedicated Processing', 'SLA Guarantee', 'Dedicated Manager'],
    buttonText: 'Schedule Call',
    popular: false,
    soon: true,
  }
];

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/transcode');
    }
  }, [navigate]);

  const scrollToPricing = () => {
    const el = document.getElementById('pricing-anchor');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-container">
      <header className="landing-header">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon" style={{ color: '#4f46e5' }}>▶</span> Zylar
        </div>
        <div className="header-actions">
          <button className="secondary-cta" onClick={scrollToPricing} style={{ border: 'none' }}>
            Pricing
          </button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
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
              <h3>Upload & Process</h3>
              <p>Drop your video file and our AWS MediaConvert pipeline automatically generates multiple quality variants.</p>
            </div>
            <div className="feature-item">
              <h3>Adaptive Streaming</h3>
              <p>HLS protocol dynamically adjusts video quality based on viewer's bandwidth for buffer-free playback.</p>
            </div>
            <div className="feature-item">
              <h3>Global CDN</h3>
              <p>CloudFront edge locations ensure low-latency delivery to viewers anywhere in the world.</p>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing-anchor" className="features-section" style={{ borderTop: '1px solid #eee', marginTop: '4rem', paddingTop: '6rem' }}>
          <h2 className="features-heading">Pricing Plans</h2>
          <p className="hero-description" style={{ marginTop: '-3rem', marginBottom: '4rem' }}>
            Choose the plan that fits your needs. Scale your video infrastructure with ease.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '1.5rem',
            margin: '0 auto',
            maxWidth: '1200px'
          }}>
            {PRICING_PLANS.map((plan) => (
              <div 
                key={plan.name}
                style={{
                  border: '1px solid #d0d0d0',
                  padding: '3rem 2rem',
                  backgroundColor: plan.popular ? '#1a1a1a' : '#ffffff',
                  color: plan.popular ? '#ffffff' : '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  textAlign: 'left'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffffff',
                    color: '#1a1a1a',
                    padding: '2px 12px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    border: '1px solid #1a1a1a'
                  }}>
                    Popular
                  </div>
                )}

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{plan.name}</h2>
                <div style={{ marginBottom: '2rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{plan.price}</span>
                  <span style={{ fontSize: '1rem', opacity: 0.7 }}>{plan.unit}</span>
                </div>

                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  margin: '0 0 3rem 0',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem'
                }}>
                  {plan.features.map(feature => (
                    <li key={feature} style={{ fontSize: '0.9rem', display: 'flex', gap: '8px' }}>
                      <span style={{ opacity: 0.5 }}>•</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => plan.soon ? null : navigate('/login')}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: plan.popular ? '#ffffff' : '#1a1a1a',
                    color: plan.popular ? '#1a1a1a' : '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: plan.soon ? 'not-allowed' : 'pointer',
                    opacity: plan.soon ? 0.6 : 1
                  }}
                >
                  {plan.soon ? 'Added Soon' : plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© 2026 Zylar. All rights reserved.</p>
      </footer>
    </div>
  );
}
