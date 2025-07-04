import React, { useState, useEffect } from "react";
import { Plus, Users, Building2, Calendar, MessageCircle, Activity, Heart, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, token }) {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newResident, setNewResident] = useState({ name: "", room: "", photo: "", facilityId: "", startDate: "", endDate: "" });
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [facilityError, setFacilityError] = useState("");
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState(null);
  const [facilityForm, setFacilityForm] = useState({ name: "", address: "", contactPerson: "", status: "ACTIVE" });
  const [showFacilityResidents, setShowFacilityResidents] = useState(false);
  const [facilityResidents, setFacilityResidents] = useState([]);
  const [facilityResidentsLoading, setFacilityResidentsLoading] = useState(false);
  const [facilityResidentsError, setFacilityResidentsError] = useState("");
  const [selectedFacility, setSelectedFacility] = useState(null);
  const navigate = useNavigate();

  // Move fetchResidents outside useEffect so it can be called after adding a resident
  const fetchResidents = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = user.role === 'family'
        ? '/api/my-residents'
        : '/api/residents';
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch residents");
      const data = await res.json();
      setResidents(data.residents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, [token, user.role]);

  useEffect(() => {
    if (user.role === 'system_admin') {
      const fetchFacilities = async () => {
        setFacilityLoading(true);
        setFacilityError("");
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/facilities`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Failed to fetch facilities");
          const data = await res.json();
          setFacilities(data.facilities);
        } catch (err) {
          setFacilityError(err.message);
        } finally {
          setFacilityLoading(false);
        }
      };
      fetchFacilities();
    }
  }, [token, user.role]);

  const handleAddResident = async (e) => {
    e.preventDefault();
    setError("");
    let photoUrl = photoPreview;
    if (photoPreview && photoPreview.startsWith("data:")) {
      setUploading(true);
      // Simulate upload delay
      await new Promise(res => setTimeout(res, 1200));
      // In production, upload to Cloudinary/Imgur/backend and get the URL
      photoUrl = "https://via.placeholder.com/80?text=Uploaded";
      setUploading(false);
    }
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newResident.name,
          room: newResident.room,
          photo: photoUrl,
          facilityId: newResident.facilityId || undefined,
          startDate: newResident.startDate || undefined,
          endDate: newResident.endDate || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add resident");
      // Re-fetch residents after adding
      await fetchResidents();
      setShowAdd(false);
      setNewResident({ name: "", room: "", photo: "", facilityId: "", startDate: "", endDate: "" });
      setPhotoPreview("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFacilityFormChange = (e) => {
    setFacilityForm({ ...facilityForm, [e.target.name]: e.target.value });
  };

  const handleAddFacility = () => {
    setEditingFacility(null);
    setFacilityForm({ name: "", address: "", contactPerson: "", status: "ACTIVE" });
    setShowFacilityModal(true);
  };

  const handleEditFacility = (facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      address: facility.address,
      contactPerson: facility.contactPerson,
      status: facility.status
    });
    setShowFacilityModal(true);
  };

  const handleFacilitySubmit = async (e) => {
    e.preventDefault();
    setFacilityError("");
    try {
      const url = `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/facilities${editingFacility ? `/${editingFacility.id}` : ""}`;
      const method = editingFacility ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(facilityForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save facility");
      if (editingFacility) {
        setFacilities(facilities.map(f => f.id === data.facility.id ? data.facility : f));
      } else {
        setFacilities([...facilities, data.facility]);
      }
      setShowFacilityModal(false);
    } catch (err) {
      setFacilityError(err.message);
    }
  };

  const handleFacilityStatus = async (facility, newStatus) => {
    setFacilityError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/facilities/${facility.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update status");
      setFacilities(facilities.map(f => f.id === data.facility.id ? data.facility : f));
    } catch (err) {
      setFacilityError(err.message);
    }
  };

  const handleFacilityRowClick = async (facility) => {
    setSelectedFacility(facility);
    setShowFacilityResidents(true);
    setFacilityResidentsLoading(true);
    setFacilityResidentsError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/facilities/${facility.id}/residents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch residents");
      setFacilityResidents(data.residents);
    } catch (err) {
      setFacilityResidentsError(err.message);
    } finally {
      setFacilityResidentsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.role === 'family' ? 'Your Loved Ones' : 'Resident Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'family' 
                  ? 'Stay connected with your family members in care'
                  : 'Manage residents and facilities'
                }
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Resident</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Residents Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {residents.map((resident) => (
              <div
                key={resident.id}
                className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/resident/${resident.id}`)}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Resident Photo */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <img
                    src={resident.photo || "https://via.placeholder.com/200x200?text=Photo"}
                    alt={resident.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute top-4 right-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Resident Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{resident.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">Room {resident.room || 'TBD'}</span>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      Click to view details
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && residents.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No residents yet</h3>
            <p className="text-gray-600 mb-6">Add your first resident to get started</p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Resident
            </button>
          </div>
        )}

        {/* Facility Management Section for System Admins */}
        {user.role === 'system_admin' && (
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Facility Management</h2>
                  <p className="text-gray-600">Manage care facilities and assignments</p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={handleAddFacility}
              >
                <Plus className="w-5 h-5" />
                Add Facility
              </button>
            </div>

            {facilityLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : facilityError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <p className="text-red-700">{facilityError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map(facility => (
                  <div key={facility.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handleFacilityRowClick(facility)}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        facility.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {facility.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{facility.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{facility.address}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>Contact: {facility.contactPerson}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Resident Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">Add Resident</h3>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowAdd(false)}
                  >
                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                  </button>
                </div>
                
                <form onSubmit={handleAddResident} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={newResident.name}
                      onChange={e => setNewResident({ ...newResident, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Room Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={newResident.room}
                      onChange={e => setNewResident({ ...newResident, room: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      onChange={handlePhotoChange}
                    />
                    {photoPreview && (
                      <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full mt-3 object-cover border-2 border-indigo-200" />
                    )}
                  </div>
                  
                  {(user.role === 'facility_staff' || user.role === 'system_admin') && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Facility</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        value={newResident.facilityId}
                        onChange={e => setNewResident({ ...newResident, facilityId: e.target.value })}
                        required
                      >
                        <option value="">Select Facility</option>
                        {facilities.map(facility => (
                          <option key={facility.id} value={facility.id}>{facility.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                      onClick={() => setShowAdd(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                      disabled={uploading}
                    >
                      {uploading ? 'Adding...' : 'Add Resident'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Facility Modal */}
        {showFacilityModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingFacility ? 'Edit Facility' : 'Add Facility'}
                  </h3>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowFacilityModal(false)}
                  >
                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                  </button>
                </div>
                
                <form onSubmit={handleFacilitySubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={facilityForm.name}
                      onChange={handleFacilityFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={facilityForm.address}
                      onChange={handleFacilityFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={facilityForm.contactPerson}
                      onChange={handleFacilityFormChange}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      name="status"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      value={facilityForm.status}
                      onChange={handleFacilityFormChange}
                      required
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                  
                  {facilityError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <p className="text-red-700 text-sm">{facilityError}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                      onClick={() => setShowFacilityModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {editingFacility ? 'Save Changes' : 'Add Facility'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Facility Residents Modal */}
        {showFacilityResidents && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">
                    Residents at {selectedFacility?.name}
                  </h3>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    onClick={() => setShowFacilityResidents(false)}
                  >
                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                  </button>
                </div>
                
                {facilityResidentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : facilityResidentsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                    <p className="text-red-700">{facilityResidentsError}</p>
                  </div>
                ) : facilityResidents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No residents currently assigned.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {facilityResidents.map(r => (
                      <div key={r.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <img src={r.photo || "https://via.placeholder.com/60x60?text=Photo"} alt={r.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800">{r.name}</div>
                          <div className="text-sm text-gray-500">Room {r.room || 'TBD'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
