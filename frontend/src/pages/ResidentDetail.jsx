import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jwt_decode from "jwt-decode";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const TABS = [
  { key: "feed", label: "Daily Feed" },
  { key: "messages", label: "Messages" },
  { key: "calendar", label: "Calendar" },
  { key: "docs", label: "Documentation" }
];

export default function ResidentDetail({ token, role }) {
  const { id } = useParams();
  const [resident, setResident] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("feed");
  const [form, setForm] = useState({ mood: '', meals: '', activities: '', notes: '', images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgForm, setMsgForm] = useState({ content: '', images: [] });
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSubmitError, setMsgSubmitError] = useState('');
  const [visits, setVisits] = useState([]);
  const [visitLoading, setVisitLoading] = useState(false);
  const [visitError, setVisitError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({ date: '', time: '', notes: '' });
  const [visitSubmitting, setVisitSubmitting] = useState(false);
  const [visitSubmitError, setVisitSubmitError] = useState('');
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Get current userId from token
  let userId = null;
  try {
    userId = jwt_decode(token).userId;
  } catch {}

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

  // Fetch messages for resident
  useEffect(() => {
    if (tab !== 'messages') return;
    const fetchMessages = async () => {
      setMsgLoading(true);
      setMsgError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch messages");
        setMessages(data.messages);
      } catch (err) {
        setMsgError(err.message);
      } finally {
        setMsgLoading(false);
      }
    };
    fetchMessages();
  }, [id, token, tab]);

  // Fetch visits for resident
  useEffect(() => {
    if (tab !== 'calendar') return;
    const fetchVisits = async () => {
      setVisitLoading(true);
      setVisitError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/visits`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch visits");
        setVisits(data.visits);
      } catch (err) {
        setVisitError(err.message);
      } finally {
        setVisitLoading(false);
      }
    };
    fetchVisits();
  }, [id, token, tab]);

  // Handle form input
  const handleInput = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleImageChange = e => {
    setForm(f => ({ ...f, images: Array.from(e.target.files) }));
  };

  // Handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      // 1. Upload images (if any)
      let imageIds = [];
      if (form.images.length > 0) {
        const formData = new FormData();
        form.images.forEach(file => formData.append('images', file));
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Image upload failed');
        imageIds = data.imageIds;
      }
      // 2. Post report
      const res2 = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          residentId: id,
          mood: form.mood,
          meals: form.meals,
          activities: form.activities,
          notes: form.notes,
          images: imageIds
        })
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.message || 'Failed to post report');
      // Refresh feed
      setForm({ mood: '', meals: '', activities: '', notes: '', images: [] });
      setReports(r => [data2.report, ...r]);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle message form input
  const handleMsgInput = e => {
    setMsgForm(f => ({ ...f, content: e.target.value }));
  };
  const handleMsgImageChange = e => {
    setMsgForm(f => ({ ...f, images: Array.from(e.target.files) }));
  };

  // Handle message send
  const handleMsgSubmit = async e => {
    e.preventDefault();
    setMsgSubmitting(true);
    setMsgSubmitError('');
    try {
      // 1. Upload images (if any)
      let imageIds = [];
      if (msgForm.images.length > 0) {
        const formData = new FormData();
        msgForm.images.forEach(file => formData.append('images', file));
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/images/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Image upload failed');
        imageIds = data.imageIds;
      }
      // 2. Determine recipientId (for MVP: send to all staff if family, or all family if staff; here, pick first other user in thread or require manual selection if none)
      let recipientId = null;
      if (messages.length > 0) {
        // Find a user in the thread who is not the current user
        const otherMsg = messages.find(m => m.senderId !== userId);
        recipientId = otherMsg ? otherMsg.senderId : null;
      }
      if (!recipientId) {
        setMsgSubmitError('No recipient found in this thread.');
        setMsgSubmitting(false);
        return;
      }
      // 3. Send message
      const res2 = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          residentId: id,
          recipientId,
          content: msgForm.content,
          images: imageIds
        })
      });
      const data2 = await res2.json();
      if (!res2.ok) throw new Error(data2.message || 'Failed to send message');
      setMsgForm({ content: '', images: [] });
      setMessages(msgs => [...msgs, data2.message]);
    } catch (err) {
      setMsgSubmitError(err.message);
    } finally {
      setMsgSubmitting(false);
    }
  };

  // Handle calendar date click
  const handleDateClick = date => {
    setSelectedDate(date);
    setSelectedVisit(null);
    setShowVisitModal(true);
    setVisitForm({ date: date.toISOString().slice(0,10), time: '', notes: '' });
  };

  // Handle visit card click
  const handleVisitClick = visit => {
    setSelectedVisit(visit);
    setSelectedDate(new Date(visit.visitDate));
    setShowVisitModal(true);
    setVisitForm({ date: visit.visitDate.slice(0,10), time: visit.visitDate.slice(11,16), notes: visit.notes || '' });
  };

  // Handle visit form input
  const handleVisitFormInput = e => {
    setVisitForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Handle visit request/submit
  const handleVisitSubmit = async e => {
    e.preventDefault();
    setVisitSubmitting(true);
    setVisitSubmitError('');
    try {
      const visitDate = new Date(`${visitForm.date}T${visitForm.time || '12:00'}`);
      let url = `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/visits`;
      let method = 'POST';
      let body = { residentId: id, visitDate, notes: visitForm.notes };
      if (selectedVisit && (role === 'facility_staff' || role === 'system_admin')) {
        url = `${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/visits/${selectedVisit.id}`;
        method = 'PUT';
        body = { ...body, status: visitForm.status || selectedVisit.status };
      }
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit visit');
      setShowVisitModal(false);
      setVisitForm({ date: '', time: '', notes: '' });
      setSelectedVisit(null);
      // Refresh visits
      setVisits(vs => {
        if (method === 'POST') return [...vs, data.visit];
        return vs.map(v => v.id === data.visit.id ? data.visit : v);
      });
    } catch (err) {
      setVisitSubmitError(err.message);
    } finally {
      setVisitSubmitting(false);
    }
  };

  // Calendar tile content: show dot if visit exists
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const hasVisit = visits.some(v => new Date(v.visitDate).toDateString() === date.toDateString());
    if (hasVisit) {
      return <span className="block w-2 h-2 mx-auto mt-1 rounded-full bg-orange-400"></span>;
    }
    return null;
  };

  // Calendar tile class: highlight today, visits
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const isToday = new Date().toDateString() === date.toDateString();
    const hasVisit = visits.some(v => new Date(v.visitDate).toDateString() === date.toDateString());
    if (isToday) return 'react-calendar__tile--active bg-yellow-200';
    if (hasVisit) return 'bg-orange-100';
    return '';
  };

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
          {/* Staff/Admin posting form */}
          {(role === 'facility_staff' || role === 'system_admin') && (
            <form className="bg-white rounded-xl shadow p-6 mb-6" onSubmit={handleSubmit}>
              <div className="font-semibold text-lg mb-4 text-indigo-700">Post Daily Update</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Mood</label>
                  <input name="mood" value={form.mood} onChange={handleInput} className="w-full border rounded px-3 py-2 mb-2" />
                  <label className="block mb-1 font-medium">Meals</label>
                  <input name="meals" value={form.meals} onChange={handleInput} className="w-full border rounded px-3 py-2 mb-2" />
                  <label className="block mb-1 font-medium">Activities</label>
                  <input name="activities" value={form.activities} onChange={handleInput} className="w-full border rounded px-3 py-2 mb-2" />
                  <label className="block mb-1 font-medium">Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleInput} className="w-full border rounded px-3 py-2 mb-2" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Images</label>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="mb-2" />
                  {form.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.images.map((file, idx) => (
                        <div key={idx} className="text-xs text-gray-500">{file.name}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {submitError && <div className="text-red-500 mt-2">{submitError}</div>}
              <button type="submit" className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50" disabled={submitting}>{submitting ? 'Posting...' : 'Post Update'}</button>
            </form>
          )}
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 font-semibold text-lg text-indigo-700">Messages</div>
          {msgLoading ? (
            <div className="text-gray-400">Loading messages...</div>
          ) : msgError ? (
            <div className="text-red-500">{msgError}</div>
          ) : (
            <div className="space-y-4 mb-6">
              {messages.length === 0 ? (
                <div className="text-gray-400">No messages yet.</div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`p-4 rounded-xl shadow ${msg.senderId === userId ? 'bg-indigo-50' : 'bg-white'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-indigo-700">{msg.sender?.name || 'User'}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="mb-2">{msg.content}</div>
                    {msg.images && msg.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.images.map(img => (
                          <img key={img.id} src={img.url} alt="Msg" className="w-16 h-16 rounded object-cover border" />
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          {/* Message send form */}
          <form className="bg-white rounded-xl shadow p-4" onSubmit={handleMsgSubmit}>
            <div className="flex flex-col md:flex-row gap-2 items-center">
              <input
                type="text"
                value={msgForm.content}
                onChange={handleMsgInput}
                placeholder="Type your message..."
                className="flex-1 border rounded px-3 py-2"
                required
              />
              <input type="file" multiple accept="image/*" onChange={handleMsgImageChange} className="" />
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50" disabled={msgSubmitting}>{msgSubmitting ? 'Sending...' : 'Send'}</button>
            </div>
            {msgForm.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {msgForm.images.map((file, idx) => (
                  <div key={idx} className="text-xs text-gray-500">{file.name}</div>
                ))}
              </div>
            )}
            {msgSubmitError && <div className="text-red-500 mt-2">{msgSubmitError}</div>}
          </form>
        </div>
      )}
      {tab === "calendar" && (
        <div className="py-4">
          <div className="mb-4 text-center font-bold text-2xl text-orange-500">Visit Calendar</div>
          {visitLoading ? (
            <div className="text-center text-orange-400">Loading visits...</div>
          ) : visitError ? (
            <div className="text-center text-red-500">{visitError}</div>
          ) : (
            <>
              <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="rounded-xl shadow-lg border-0 w-full max-w-md mx-auto text-base"
                calendarType="US"
              />
              {/* List of visits for selected date */}
              <div className="mt-6">
                {selectedDate && (
                  <>
                    <div className="text-lg font-semibold text-orange-600 mb-2 text-center">Visits on {selectedDate.toLocaleDateString()}</div>
                    {visits.filter(v => new Date(v.visitDate).toDateString() === selectedDate.toDateString()).length === 0 ? (
                      <div className="text-center text-gray-400">No visits scheduled.</div>
                    ) : (
                      <div className="space-y-3">
                        {visits.filter(v => new Date(v.visitDate).toDateString() === selectedDate.toDateString()).map(v => (
                          <div key={v.id} className="bg-orange-50 rounded-xl p-4 shadow flex flex-col md:flex-row md:items-center gap-2 cursor-pointer border border-orange-200" onClick={() => handleVisitClick(v)}>
                            <div className="flex-1">
                              <div className="font-bold text-orange-700">{new Date(v.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              <div className="text-sm text-gray-600">Requested by: {v.requestedBy?.name}</div>
                              <div className="text-xs text-gray-500">Status: <span className="font-semibold text-orange-600">{v.status}</span></div>
                              {v.notes && <div className="text-xs text-gray-500 mt-1">Notes: {v.notes}</div>}
                            </div>
                            {(role === 'facility_staff' || role === 'system_admin') && (
                              <button className="px-3 py-1 bg-green-500 text-white rounded shadow hover:bg-green-600 text-xs" onClick={e => { e.stopPropagation(); setSelectedVisit(v); setShowVisitModal(true); }}>Manage</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Request visit button for family */}
              {role === 'family' && selectedDate && (
                <div className="mt-4 flex justify-center">
                  <button className="px-6 py-2 bg-orange-500 text-white rounded-full shadow-lg font-bold text-lg hover:bg-orange-600 transition" onClick={() => { setSelectedVisit(null); setShowVisitModal(true); }}>Request Visit</button>
                </div>
              )}
            </>
          )}
          {/* Visit Modal */}
          {showVisitModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative mx-2">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl" onClick={() => setShowVisitModal(false)} aria-label="Close">&times;</button>
                <h3 className="text-xl font-bold text-orange-600 mb-4">{selectedVisit ? (role === 'family' ? 'Visit Details' : 'Manage Visit') : 'Request Visit'}</h3>
                <form onSubmit={handleVisitSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Date</label>
                    <input type="date" name="date" className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" value={visitForm.date} onChange={handleVisitFormInput} required disabled={!!selectedVisit} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Time</label>
                    <input type="time" name="time" className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" value={visitForm.time} onChange={handleVisitFormInput} required={role === 'family'} disabled={!!selectedVisit && role === 'family'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-orange-700 mb-1">Notes</label>
                    <textarea name="notes" className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" value={visitForm.notes} onChange={handleVisitFormInput} disabled={!!selectedVisit && role === 'family'} />
                  </div>
                  {/* Staff/admin can update status */}
                  {selectedVisit && (role === 'facility_staff' || role === 'system_admin') && (
                    <div>
                      <label className="block text-sm font-medium text-orange-700 mb-1">Status</label>
                      <select name="status" className="w-full px-4 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-400 focus:outline-none" value={visitForm.status || selectedVisit.status} onChange={handleVisitFormInput}>
                        <option value="REQUESTED">Requested</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="DECLINED">Declined</option>
                      </select>
                    </div>
                  )}
                  {visitSubmitError && <div className="text-red-500 text-sm text-center">{visitSubmitError}</div>}
                  <button type="submit" className="w-full py-2 bg-orange-500 text-white font-semibold rounded-lg shadow hover:bg-orange-600 transition" disabled={visitSubmitting}>{visitSubmitting ? (selectedVisit ? 'Saving...' : 'Requesting...') : (selectedVisit ? 'Save Changes' : 'Request Visit')}</button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "docs" && (
        <div className="text-gray-400 text-center py-10">Documentation tab coming soon.</div>
      )}
    </div>
  );
} 