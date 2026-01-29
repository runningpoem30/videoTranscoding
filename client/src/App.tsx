import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import TranscodingVideo from './components/TranscodingVideo';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/transcode" element={<TranscodingVideo />} />
      </Routes>
    </Router>
  );
}

export default App;
