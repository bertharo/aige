import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResidentDetail from "./pages/ResidentDetail";
import { BellIcon } from '@heroicons/react/24/solid';

function AppRoutes({ user, token, handleLogout, handleLogin }) {
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [notifError, setNotifError] = React.useState("");
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Fetch notifications
  React.useEffect(() => {
    if (!user) return;
    const fetchNotifs = async () => {
      setNotifLoading(true);
      setNotifError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch notifications");
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter(n => !n.read).length);
      } catch (err) {
        setNotifError(err.message);
      } finally {
        setNotifLoading(false);
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user, token]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, read: true } : notif));
      setUnreadCount(c => Math.max(0, c - 1));
    } catch {}
  };

  if (!user) return <Login onLogin={handleLogin} />;
  return (
    <>
      <div className="flex justify-end items-center p-4 relative">
        {/* Notification Bell */}
        <button className="relative mr-4" onClick={() => setShowNotif(v => !v)} aria-label="Notifications">
          <BellIcon className="w-7 h-7 text-orange-500" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full text-xs px-1.5 py-0.5 font-bold shadow">{unreadCount}</span>
          )}
        </button>
        {/* Notification Dropdown */}
        {showNotif && (
          <div className="absolute right-0 top-12 w-80 max-w-xs bg-white rounded-xl shadow-xl border border-orange-100 z-50 animate-fade-in">
            <div className="p-3 border-b border-orange-100 font-bold text-orange-600">Notifications</div>
            {notifLoading ? (
              <div className="p-4 text-orange-400 text-center">Loading...</div>
            ) : notifError ? (
              <div className="p-4 text-red-500 text-center">{notifError}</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-gray-400 text-center">No notifications</div>
            ) : (
              <ul className="max-h-80 overflow-y-auto divide-y divide-orange-50">
                {notifications.map(n => (
                  <li key={n.id} className={`p-3 cursor-pointer hover:bg-orange-50 transition ${!n.read ? 'bg-orange-100' : ''}`} onClick={() => { markAsRead(n.id); setShowNotif(false); }}>
                    <div className="font-semibold text-orange-700 text-sm">{n.type}</div>
                    <div className="text-gray-700 text-sm mb-1">{n.message}</div>
                    <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
          onClick={handleLogout}
        >
          Log out
        </button>
      </div>
      <Routes>
        <Route path="/" element={<Dashboard user={user} token={token} navigate={navigate} />} />
        <Route path="/resident/:id" element={<ResidentDetail token={token} role={user.role} />} />
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