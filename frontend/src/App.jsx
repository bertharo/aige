import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResidentDetail from "./pages/ResidentDetail";
import UserManagement from "./pages/UserManagement";
import { BellIcon } from '@heroicons/react/24/solid';
import { ArrowLeft, Home, Users, LogOut, Menu, X } from "lucide-react";

function NavigationHeader({ user, token, handleLogout, navigate, location }) {
  const [showNotif, setShowNotif] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [notifLoading, setNotifLoading] = React.useState(false);
  const [notifError, setNotifError] = React.useState("");
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

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

  // Get breadcrumb data based on current location
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') {
      return [{ label: 'Dashboard', path: '/' }];
    } else if (path.startsWith('/resident/')) {
      return [
        { label: 'Dashboard', path: '/' },
        { label: 'Resident Details', path: path }
      ];
    }
    return [{ label: 'Dashboard', path: '/' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Navigation and Breadcrumbs */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Back button for resident detail page */}
            {location.pathname.startsWith('/resident/') && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            )}

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center space-x-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  {index > 0 && <span className="text-gray-400 mx-2">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  ) : (
                    <button
                      onClick={() => navigate(crumb.path)}
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-all duration-200"
                    >
                      {crumb.label}
                    </button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" 
                onClick={() => setShowNotif(v => !v)} 
                aria-label="Notifications"
              >
                <BellIcon className="w-5 h-5 text-orange-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full text-xs px-1.5 py-0.5 font-bold shadow min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotif && (
                <div className="absolute right-0 top-12 w-80 max-w-xs bg-white rounded-2xl shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-800">Notifications</h3>
                  </div>
                  {notifLoading ? (
                    <div className="p-4 text-gray-500 text-center">Loading...</div>
                  ) : notifError ? (
                    <div className="p-4 text-red-500 text-center">{notifError}</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-gray-400 text-center">No notifications</div>
                  ) : (
                    <ul className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <li key={n.id} className={`p-4 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-orange-50' : ''}`} onClick={() => { markAsRead(n.id); setShowNotif(false); }}>
                          <div className="font-semibold text-gray-800 text-sm">{n.type}</div>
                          <div className="text-gray-600 text-sm mb-1">{n.message}</div>
                          <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* User info */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
              </div>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => { navigate('/'); setShowMobileMenu(false); }}
                className="flex items-center gap-3 w-full px-3 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
              {location.pathname.startsWith('/resident/') && (
                <button
                  onClick={() => { navigate('/'); setShowMobileMenu(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2 text-left text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

function AppRoutes({ user, token, handleLogout, handleLogin }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Login onLogin={handleLogin} />;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <NavigationHeader 
        user={user} 
        token={token} 
        handleLogout={handleLogout} 
        navigate={navigate}
        location={location}
      />
      <div className="pt-4">
        <Routes>
          <Route path="/" element={<Dashboard user={user} token={token} navigate={navigate} />} />
          <Route path="/resident/:id" element={<ResidentDetail token={token} role={user.role} />} />
          <Route path="/account" element={<UserManagement user={user} token={token} />} />
        </Routes>
      </div>
    </div>
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