import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/dashboard/HomePage";
import CameraPage from "./pages/camera/CameraPage";
import SettingsPage from "./pages/settings/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/camera" element={<CameraPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
