import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';
import LanguagePicker from './components/LanguagePicker';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffPost from './pages/StaffPost';
import FamilyFeed from './pages/FamilyFeed';
import AdminPanel from './pages/AdminPanel';
import InstallPrompt from './components/InstallPrompt';

const STORAGE_KEY = 'kinness_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.user?.id || !parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

function roleHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'staff') return '/staff/post';
  return '/family/feed';
}

function ProtectedRoute({ session, allowedRole, children }) {
  if (!session?.user) return <Navigate to="/login" replace />;
  if (allowedRole && session.user.role !== allowedRole) {
    return <Navigate to={roleHome(session.user.role)} replace />;
  }
  return children;
}

function AppRoutes() {
  const navigate = useNavigate();
  const [session, setSession] = useState(loadSession);
  const [showRegister, setShowRegister] = useState(false);

  const handleAuth = useCallback(
    (user, token, redirect) => {
      if (!user?.id || !token) {
        return;
      }
      const next = { user, token };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSession(next);
      navigate(redirect || roleHome(user.role), { replace: true });
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const user = session?.user;
  const token = session?.token;

  if (!user) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              onLogin={handleAuth}
              onSwitchToRegister={() => {
                setShowRegister(true);
                navigate('/register');
              }}
            />
          }
        />
        <Route
          path="/register"
          element={
            <Register
              onRegister={handleAuth}
              onSwitchToLogin={() => {
                setShowRegister(false);
                navigate('/login');
              }}
            />
          }
        />
        <Route
          path="*"
          element={
            showRegister ? (
              <Navigate to="/register" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route
        path="/staff/post"
        element={
          <ProtectedRoute session={session} allowedRole="staff">
            <StaffPost user={user} token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/family/feed"
        element={
          <ProtectedRoute session={session} allowedRole="family">
            <FamilyFeed user={user} token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute session={session} allowedRole="admin">
            <AdminPanel user={user} token={token} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Navigate to={roleHome(user.role)} replace />} />
      <Route path="*" element={<Navigate to={roleHome(user.role)} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </LanguageProvider>
  );
}

function AppShell() {
  const { langChosen, showPicker, chooseLanguage } = useLanguage();

  if (!langChosen || showPicker) {
    return <LanguagePicker onChoose={chooseLanguage} />;
  }

  return (
    <>
      <InstallPrompt />
      <AppRoutes />
    </>
  );
}

export default App;
