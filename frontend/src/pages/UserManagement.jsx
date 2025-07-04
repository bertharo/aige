import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Shield, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Plus,
  Users,
  Settings,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

export default function UserManagement({ user, token }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'family',
    newPassword: '',
    currentPassword: ''
  });

  const [deletePassword, setDeletePassword] = useState('');

  useEffect(() => {
    fetchProfile();
    // Allow system admins and facility staff to see users
    if (user.role === 'system_admin' || user.role === 'facility_staff') {
      fetchAllUsers();
    }
  }, [user.role]);

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile with token:', token ? 'Token exists' : 'No token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Profile response status:', response.status);
      const data = await response.json();
      console.log('Profile response data:', data);
      if (data.success) {
        setProfile(data.user);
        setProfileForm({
          name: data.user.name,
          email: data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAllUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const updateData = {
        name: profileForm.name,
        email: profileForm.email
      };

      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setShowEditProfile(false);
        setError(null);
        // Update the user context if needed
        window.location.reload(); // Simple refresh to update user context
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to update profile');
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/user/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete account');
    }
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });

      const data = await response.json();
      if (data.success) {
        setAllUsers(allUsers.map(u => u.id === editingUser.id ? data.user : u));
        setShowUserModal(false);
        setEditingUser(null);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleUserDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAllUsers(allUsers.filter(u => u.id !== userId));
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      newPassword: '',
      currentPassword: ''
    });
    setShowUserModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Account Management
                </h1>
                <p className="text-gray-600">Manage your profile and account settings</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Section */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-xl">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
            </div>

            {profile && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-indigo-100 rounded-xl">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-semibold text-gray-800">{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Shield className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <p className="font-semibold text-gray-800 capitalize">{profile.role.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Management Section (Admin and Staff) */}
          {(user.role === 'system_admin' || user.role === 'facility_staff') && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                </div>
                {user.role === 'system_admin' && (
                  <button
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({ name: '', email: '', role: 'family', newPassword: '', currentPassword: '' });
                      setShowUserModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add User
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {allUsers.map(listedUser => {
                  // Determine what actions the current user can perform on this user
                  const canEdit = 
                    listedUser.id === profile?.id || 
                    user.role === 'system_admin' ||
                    (user.role === 'facility_staff' && listedUser.role === 'family');
                  
                  const canDelete = 
                    listedUser.id !== profile?.id && (
                      user.role === 'system_admin' ||
                      (user.role === 'facility_staff' && listedUser.role === 'family')
                    );
                  
                  return (
                    <div key={listedUser.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-xl">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{listedUser.name}</p>
                            <p className="text-sm text-gray-500">{listedUser.email}</p>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                              listedUser.role === 'system_admin' ? 'bg-purple-100 text-purple-700' :
                              listedUser.role === 'facility_staff' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {listedUser.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {canEdit && (
                          <button
                            onClick={() => openEditUser(listedUser)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit user"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleUserDelete(listedUser.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            View only
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Edit Profile</h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowEditProfile(false)}
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">New Password (optional)</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                      value={profileForm.newPassword}
                      onChange={e => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                {profileForm.newPassword && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all pr-12"
                          value={profileForm.currentPassword}
                          onChange={e => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={profileForm.confirmPassword}
                        onChange={e => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                    onClick={() => setShowEditProfile(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Delete Account</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              
              <form onSubmit={handleDeleteAccount} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                    placeholder="Enter your password to confirm"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* User Management Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  onClick={() => setShowUserModal(false)}
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <form onSubmit={handleUserUpdate} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
                
                {/* Only system admins can change roles */}
                {user.role === 'system_admin' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={userForm.role}
                      onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                      required
                    >
                      <option value="family">Family Member</option>
                      <option value="facility_staff">Facility Staff</option>
                      <option value="system_admin">System Admin</option>
                    </select>
                  </div>
                )}
                
                {/* Password field - only for system admins or when editing own profile */}
                {(user.role === 'system_admin' || (editingUser && editingUser.id === profile?.id)) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {user.role === 'system_admin' ? 'New Password (optional)' : 'New Password (optional)'}
                    </label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={userForm.newPassword}
                      onChange={e => setUserForm({ ...userForm, newPassword: e.target.value })}
                      placeholder={user.role === 'system_admin' ? 'Leave blank to keep current password' : 'Leave blank to keep current password'}
                    />
                  </div>
                )}
                
                {/* Show current password field for users editing their own profile */}
                {editingUser && editingUser.id === profile?.id && userForm.newPassword && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={userForm.currentPassword || ''}
                      onChange={e => setUserForm({ ...userForm, currentPassword: e.target.value })}
                      placeholder="Enter current password to change password"
                      required
                    />
                  </div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                    onClick={() => setShowUserModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingUser ? 'Save Changes' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 