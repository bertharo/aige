import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-indigo-700">Your Loved Ones</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            onClick={() => setShowAdd(true)}
          >
            <PlusIcon className="w-5 h-5" /> Add Resident
          </button>
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Loading residents...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {residents.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl shadow p-4 flex flex-col items-center hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/resident/${r.id}`)}
              >
                <img
                  src={r.photo}
                  alt={r.name}
                  className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-indigo-200"
                />
                <div className="font-semibold text-lg text-gray-800">{r.name}</div>
                <div className="text-sm text-gray-500">Room: {r.room}</div>
              </div>
            ))}
          </div>
        )}

        {/* Facility Management Section for System Admins */}
        {user.role === 'system_admin' && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-indigo-700">Facility Management</h2>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
                onClick={handleAddFacility}
              >
                <PlusIcon className="w-5 h-5" /> Add Facility
              </button>
            </div>
            {facilityLoading ? (
              <div className="text-center text-gray-500">Loading facilities...</div>
            ) : facilityError ? (
              <div className="text-center text-red-500">{facilityError}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-xl shadow">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Address</th>
                      <th className="px-4 py-2 text-left">Contact Person</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facilities.map(facility => (
                      <tr key={facility.id} className="border-t cursor-pointer hover:bg-indigo-50" onClick={() => handleFacilityRowClick(facility)}>
                        <td className="px-4 py-2">{facility.name}</td>
                        <td className="px-4 py-2">{facility.address}</td>
                        <td className="px-4 py-2">{facility.contactPerson}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${facility.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{facility.status}</span>
                        </td>
                        <td className="px-4 py-2 flex gap-2" onClick={e => e.stopPropagation()}>
                          <button
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                            onClick={() => handleEditFacility(facility)}
                          >Edit</button>
                          {facility.status === 'ACTIVE' ? (
                            <button
                              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                              onClick={() => handleFacilityStatus(facility, 'INACTIVE')}
                            >Deactivate</button>
                          ) : (
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                              onClick={() => handleFacilityStatus(facility, 'ACTIVE')}
                            >Reactivate</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {/* Facility Modal */}
            {showFacilityModal && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                    onClick={() => setShowFacilityModal(false)}
                    aria-label="Close"
                  >
                    &times;
                  </button>
                  <h3 className="text-xl font-bold text-indigo-700 mb-4">{editingFacility ? 'Edit Facility' : 'Add Facility'}</h3>
                  <form onSubmit={handleFacilitySubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        value={facilityForm.name}
                        onChange={handleFacilityFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        name="address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        value={facilityForm.address}
                        onChange={handleFacilityFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        name="contactPerson"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        value={facilityForm.contactPerson}
                        onChange={handleFacilityFormChange}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        value={facilityForm.status}
                        onChange={handleFacilityFormChange}
                        required
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    {facilityError && <div className="text-red-500 text-sm text-center">{facilityError}</div>}
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                    >
                      {editingFacility ? 'Save Changes' : 'Add Facility'}
                    </button>
                  </form>
                </div>
          </div>
        )}
      </div>
        )}

      {/* Add Resident Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowAdd(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold text-indigo-700 mb-4">Add Resident</h3>
            <form onSubmit={handleAddResident} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={newResident.name}
                  onChange={e => setNewResident({ ...newResident, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                  value={newResident.room}
                  onChange={e => setNewResident({ ...newResident, room: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full"
                  onChange={handlePhotoChange}
                />
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="w-16 h-16 rounded-full mt-2 object-cover" />
                )}
              </div>
                {(user.role === 'facility_staff' || user.role === 'system_admin') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
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
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          value={newResident.startDate}
                          onChange={e => setNewResident({ ...newResident, startDate: e.target.value })}
                          required
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                          value={newResident.endDate}
                          onChange={e => setNewResident({ ...newResident, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                  disabled={uploading}
              >
                {uploading ? "Uploading..." : "Add Resident"}
              </button>
            </form>
          </div>
        </div>
      )}

        {/* Facility Residents Modal */}
        {showFacilityResidents && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setShowFacilityResidents(false)}
                aria-label="Close"
              >
                &times;
              </button>
              <h3 className="text-xl font-bold text-indigo-700 mb-4">Residents at {selectedFacility?.name}</h3>
              {facilityResidentsLoading ? (
                <div className="text-center text-gray-500">Loading residents...</div>
              ) : facilityResidentsError ? (
                <div className="text-center text-red-500">{facilityResidentsError}</div>
              ) : facilityResidents.length === 0 ? (
                <div className="text-center text-gray-500">No residents currently assigned.</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {facilityResidents.map(r => (
                    <li key={r.id} className="py-2 flex items-center gap-3">
                      <img src={r.photo} alt={r.name} className="w-10 h-10 rounded-full object-cover border" />
                      <div>
                        <div className="font-semibold text-gray-800">{r.name}</div>
                        <div className="text-xs text-gray-500">Room: {r.room}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 