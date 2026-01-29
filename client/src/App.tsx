import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './components/LandingPage';
import TranscodingVideo from './components/TranscodingVideo';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transcode" element={<TranscodingVideo />} />
      </Routes>
      <Analytics />
    </Router>
  );
}

export default App;
