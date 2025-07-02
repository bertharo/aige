import React, { useState, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, token }) {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newResident, setNewResident] = useState({ name: "", room: "", photo: "" });
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResidents = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch residents");
        const data = await res.json();
        setResidents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResidents();
  }, [token]);

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
          photo: photoUrl
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add resident");
      setResidents([...residents, data.resident]);
      setShowAdd(false);
      setNewResident({ name: "", room: "", photo: "" });
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-indigo-700">Your Loved Ones</h2>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
            onClick={() => setShowAdd(true)}
            disabled={user.role !== 'facility_staff' && user.role !== 'system_admin'}
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
      </div>

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
              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
                disabled={user.role !== 'facility_staff' && user.role !== 'system_admin' || uploading}
              >
                {uploading ? "Uploading..." : "Add Resident"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 