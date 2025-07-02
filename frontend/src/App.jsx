import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResidentDetail from "./pages/ResidentDetail";

function AppRoutes({ user, token, handleLogout, handleLogin }) {
  const navigate = useNavigate();
  if (!user) return <Login onLogin={handleLogin} />;
  return (
    <>
      <div className="flex justify-end p-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard user={user} token={token} navigate={navigate} />} />
        <Route path="/resident/:id" element={<ResidentDetail token={token} />} />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (user, token) => {
    setUser(user);
    setToken(token);
  };

  const handleRegister = (user, token) => {
    setUser(user);
    setToken(token);
    setShowRegister(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <Router>
      {!user ? (
        showRegister ? (
          <Register onRegister={handleRegister} onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onLogin={handleLogin} onSwitchToRegister={() => setShowRegister(true)} />
        )
      ) : (
        <AppRoutes user={user} token={token} handleLogout={handleLogout} handleLogin={handleLogin} />
      )}
    </Router>
  );
}

export default App; 