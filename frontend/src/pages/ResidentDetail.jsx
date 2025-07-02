import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const TABS = [
  { key: "feed", label: "Daily Feed" },
  { key: "messages", label: "Messages" },
  { key: "calendar", label: "Calendar" },
  { key: "docs", label: "Documentation" }
];

export default function ResidentDetail({ token }) {
  const { id } = useParams();
  const [resident, setResident] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("feed");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res1 = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data1 = await res1.json();
        if (!res1.ok) throw new Error(data1.message || "Failed to fetch resident");
        setResident(data1.resident);

        const res2 = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.message || "Failed to fetch reports");
        setReports(data2.reports);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, token]);

  if (loading) return <div className="text-center text-gray-500 py-10">Loading resident details...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!resident) return null;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center gap-6 mb-8">
        <img src={resident.photo} alt={resident.name} className="w-24 h-24 rounded-full object-cover border-2 border-indigo-200" />
        <div>
          <div className="text-2xl font-bold text-indigo-700">{resident.name}</div>
          <div className="text-gray-500">Room: {resident.room}</div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`py-2 px-4 font-medium border-b-2 transition-all ${tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-gray-500 hover:text-indigo-600"}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      {tab === "feed" && (
        <div className="space-y-6">
          {reports.length === 0 ? (
            <div className="text-gray-400">No daily reports yet.</div>
          ) : (
            reports.map(report => (
              <div key={report.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-indigo-700">{new Date(report.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-400">By: {report.staff?.name || "Staff"}</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-1"><span className="font-medium">Mood:</span> {report.mood || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Meals:</span> {report.meals || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Activities:</span> {report.activities || "-"}</div>
                    <div className="mb-1"><span className="font-medium">Notes:</span> {report.notes || "-"}</div>
                  </div>
                  {report.images && report.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {report.images.map(img => (
                        <img key={img.id} src={img.url} alt="Report" className="w-20 h-20 rounded-lg object-cover border" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
      {tab === "messages" && (
        <div className="text-gray-400 text-center py-10">Messages tab coming soon.</div>
      )}
      {tab === "calendar" && (
        <div className="text-gray-400 text-center py-10">Calendar tab coming soon.</div>
      )}
      {tab === "docs" && (
        <div className="text-gray-400 text-center py-10">Documentation tab coming soon.</div>
      )}
    </div>
  );
} 