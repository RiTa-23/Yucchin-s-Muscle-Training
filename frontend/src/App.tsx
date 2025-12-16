import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing/LandingPage";
import AuthPage from "./pages/auth/AuthPage";
import HomePage from "./pages/dashboard/HomePage";
import CameraPage from "./pages/camera/CameraPage";
import SettingsPage from "./pages/settings/SettingsPage";
import CollectionPage from "./pages/collection/CollectionPage";
import GanbarinorekisiPage from "./pages/gannbarinorekisi/GanbarinorekisiPage";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camera"
            element={
              <ProtectedRoute>
                <CameraPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection"
            element={
              <ProtectedRoute>
                <CollectionPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/gannbarinorekisi"
            element={
              <ProtectedRoute>
                <GanbarinorekisiPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
