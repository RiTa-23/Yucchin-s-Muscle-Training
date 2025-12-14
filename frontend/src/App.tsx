import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import HomePage from './pages/dashboard/HomePage';
import CameraPage from './pages/camera/CameraPage';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/camera" element={<CameraPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
