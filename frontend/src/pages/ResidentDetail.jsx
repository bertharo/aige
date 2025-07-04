import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  Activity, 
  MessageCircle, 
  Calendar as CalendarIcon, 
  FileText, 
  Heart, 
  Camera, 
  Send, 
  Clock, 
  MapPin, 
  User,
  Plus,
  X
} from "lucide-react";

const TABS = [
  { key: "feed", label: "Daily Feed", icon: Activity },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "calendar", label: "Calendar", icon: CalendarIcon },
  { key: "docs", label: "Documentation", icon: FileText }
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
  const [docs, setDocs] = useState(null);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState("");

  // Get current userId from token
  let userId = null;
  try {
    userId = jwtDecode(token).userId;
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

        // Fetch feed data (reports) for the default tab
        const res2 = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/feed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data2 = await res2.json();
        if (!res2.ok) throw new Error(data2.message || "Failed to fetch feed");
        setReports(data2.feed);
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

  // Fetch calendar data for resident
  useEffect(() => {
    if (tab !== 'calendar') return;
    const fetchCalendar = async () => {
      setVisitLoading(true);
      setVisitError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/calendar`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch calendar");
        setVisits(data.calendar);
      } catch (err) {
        setVisitError(err.message);
      } finally {
        setVisitLoading(false);
      }
    };
    fetchCalendar();
  }, [id, token, tab]);

  // Fetch feed data when tab changes to feed
  useEffect(() => {
    if (tab !== 'feed') return;
    const fetchFeed = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/feed`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch feed");
        setReports(data.feed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id, token, tab]);

  // Fetch documentation for resident
  useEffect(() => {
    if (tab !== 'docs') return;
    const fetchDocs = async () => {
      setDocsLoading(true);
      setDocsError("");
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/residents/${id}/docs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch documentation");
        setDocs(data.docs);
      } catch (err) {
        setDocsError(err.message);
      } finally {
        setDocsLoading(false);
      }
    };
    fetchDocs();
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

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading resident details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="w-8 h-8 text-red-600" />
        </div>
        <p className="text-red-600">{error}</p>
      </div>
    </div>
  );
  
  if (!resident) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <img 
                src={resident.photo || "https://via.placeholder.com/120x120?text=Photo"} 
                alt={resident.name} 
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg" 
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {resident.name}
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Room {resident.room || 'TBD'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{role === 'family' ? 'Family Member' : 'Resident'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
              {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-lg p-2 mb-8">
          <div className="flex gap-2">
            {TABS.map(t => {
              const IconComponent = t.icon;
              return (
                <button
                  key={t.key}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
                    tab === t.key 
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => setTab(t.key)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      {/* Tab Content */}
      {tab === "feed" && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Daily Updates</h2>
              <p className="text-gray-600">Stay updated with daily activities and progress</p>
            </div>
          </div>
          
          {/* Staff/Admin posting form */}
          {(role === 'facility_staff' || role === 'system_admin') && (
            <form className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8" onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Post Daily Update</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mood</label>
                    <input 
                      name="mood" 
                      value={form.mood} 
                      onChange={handleInput} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="How is the resident feeling?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Meals</label>
                    <input 
                      name="meals" 
                      value={form.meals} 
                      onChange={handleInput} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="What did they eat today?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Activities</label>
                    <input 
                      name="activities" 
                      value={form.activities} 
                      onChange={handleInput} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      placeholder="What activities did they do?"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea 
                      name="notes" 
                      value={form.notes} 
                      onChange={handleInput} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none" 
                      placeholder="Additional notes..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    />
                    {form.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.images.map((file, idx) => (
                          <div key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4">
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold" 
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post Update'}
              </button>
            </form>
          )}
          
          {/* Reports Display */}
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No updates yet</h3>
              <p className="text-gray-600">Daily reports will appear here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map(report => (
                <div key={report.id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{new Date(report.date).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">By: {report.staff?.name || "Staff"}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {report.mood && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl">
                          <Heart className="w-4 h-4 text-blue-600" />
                          <span className="text-blue-700"><span className="font-medium">Mood:</span> {report.mood}</span>
                        </div>
                      )}
                      {report.meals && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl">
                          <span className="text-green-700">🍽️ <span className="font-medium">Meals:</span> {report.meals}</span>
                        </div>
                      )}
                      {report.activities && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-700"><span className="font-medium">Activities:</span> {report.activities}</span>
                        </div>
                      )}
                      {report.notes && (
                        <div className="px-3 py-2 bg-gray-50 rounded-xl">
                          <span className="text-gray-700"><span className="font-medium">Notes:</span> {report.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    {report.images && report.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-3">
                        {report.images.map(img => (
                          <div key={img.id} className="relative group">
                            <img 
                              src={img.url} 
                              alt="Report" 
                              className="w-full h-32 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300"></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab === "messages" && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
              <p className="text-gray-600">Direct communication with care staff</p>
            </div>
          </div>
          
          {msgLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : msgError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700">{msgError}</p>
            </div>
          ) : (
            <div className="space-y-6 mb-8">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No messages yet</h3>
                  <p className="text-gray-600">Start a conversation with care staff</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`p-6 rounded-2xl shadow-sm ${
                    msg.senderId === userId 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 ml-8' 
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 mr-8'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-xl ${
                        msg.senderId === userId 
                          ? 'bg-green-100' 
                          : 'bg-gray-200'
                      }`}>
                        <User className={`w-4 h-4 ${
                          msg.senderId === userId 
                            ? 'text-green-600' 
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <span className="font-semibold text-gray-800">{msg.sender?.name || 'User'}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(msg.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-700 mb-3 leading-relaxed">{msg.content}</div>
                    {msg.images && msg.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {msg.images.map(img => (
                          <div key={img.id} className="relative group">
                            <img 
                              src={img.url} 
                              alt="Message" 
                              className="w-full h-24 object-cover rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all duration-300"></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Message send form */}
          <form className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6" onSubmit={handleMsgSubmit}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-xl">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Send Message</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <input
                  type="text"
                  value={msgForm.content}
                  onChange={handleMsgInput}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleMsgImageChange} 
                  className="px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all" 
                />
              </div>
              
              {msgForm.images.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msgForm.images.map((file, idx) => (
                    <div key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              
              {msgSubmitError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <p className="text-red-700 text-sm">{msgSubmitError}</p>
                </div>
              )}
              
              <button 
                type="submit" 
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold" 
                disabled={msgSubmitting}
              >
                {msgSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      )}
      {tab === "calendar" && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
              <CalendarIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Visit Calendar</h2>
              <p className="text-gray-600">Schedule and manage visits</p>
            </div>
          </div>
          
          {visitLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : visitError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700">{visitError}</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                <Calendar
                  onClickDay={handleDateClick}
                  value={selectedDate}
                  tileContent={tileContent}
                  tileClassName={tileClassName}
                  className="rounded-2xl shadow-lg border-0 w-full max-w-md mx-auto text-base bg-white"
                />
              </div>
              
              {/* List of visits for selected date */}
              {selectedDate && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-orange-100 rounded-xl">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Visits on {selectedDate.toLocaleDateString()}
                    </h3>
                  </div>
                  
                  {visits.filter(v => new Date(v.visitDate).toDateString() === selectedDate.toDateString()).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500">No visits scheduled for this date</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {visits.filter(v => new Date(v.visitDate).toDateString() === selectedDate.toDateString()).map(v => (
                        <div key={v.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-orange-200" onClick={() => handleVisitClick(v)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-orange-100 rounded-xl">
                                <Clock className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <div className="font-bold text-orange-700 text-lg">
                                  {new Date(v.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm text-gray-600">Requested by: {v.requestedBy?.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    v.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' :
                                    v.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                    v.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {v.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {(role === 'facility_staff' || role === 'system_admin') && (
                              <button 
                                className="px-4 py-2 bg-green-500 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-sm font-semibold" 
                                onClick={e => { e.stopPropagation(); setSelectedVisit(v); setShowVisitModal(true); }}
                              >
                                Manage
                              </button>
                            )}
                          </div>
                          {v.notes && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Notes:</span> {v.notes}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Request visit button for family */}
                  {role === 'family' && (
                    <div className="mt-6 flex justify-center">
                      <button 
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg" 
                        onClick={() => { setSelectedVisit(null); setShowVisitModal(true); }}
                      >
                        Request Visit
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Visit Modal */}
          {showVisitModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-xl">
                        <CalendarIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {selectedVisit ? (role === 'family' ? 'Visit Details' : 'Manage Visit') : 'Request Visit'}
                      </h3>
                    </div>
                    <button 
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                      onClick={() => setShowVisitModal(false)}
                    >
                      <X className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <form onSubmit={handleVisitSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                      <input 
                        type="date" 
                        name="date" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                        value={visitForm.date} 
                        onChange={handleVisitFormInput} 
                        required 
                        disabled={!!selectedVisit} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                      <input 
                        type="time" 
                        name="time" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                        value={visitForm.time} 
                        onChange={handleVisitFormInput} 
                        required={role === 'family'} 
                        disabled={!!selectedVisit && role === 'family'} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                      <textarea 
                        name="notes" 
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none" 
                        value={visitForm.notes} 
                        onChange={handleVisitFormInput} 
                        disabled={!!selectedVisit && role === 'family'} 
                        placeholder="Additional notes..."
                      />
                    </div>
                    
                    {/* Staff/admin can update status */}
                    {selectedVisit && (role === 'facility_staff' || role === 'system_admin') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                        <select 
                          name="status" 
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" 
                          value={visitForm.status || selectedVisit.status} 
                          onChange={handleVisitFormInput}
                        >
                          <option value="REQUESTED">Requested</option>
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="DECLINED">Declined</option>
                        </select>
                      </div>
                    )}
                    
                    {visitSubmitError && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <p className="text-red-700 text-sm text-center">{visitSubmitError}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-4">
                      <button 
                        type="button"
                        className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all"
                        onClick={() => setShowVisitModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 font-semibold" 
                        disabled={visitSubmitting}
                      >
                        {visitSubmitting ? (selectedVisit ? 'Saving...' : 'Requesting...') : (selectedVisit ? 'Save Changes' : 'Request Visit')}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {tab === "docs" && (
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Documentation</h2>
              <p className="text-gray-600">Care plans, medical info, and important dates</p>
            </div>
          </div>
          
          {docsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : docsError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <p className="text-red-700">{docsError}</p>
            </div>
          ) : docs ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Care Plan */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Heart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Care Plan</h3>
                </div>
                {docs.carePlan ? (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{docs.carePlan}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400">No care plan available</p>
                  </div>
                )}
              </div>

              {/* Medical Information */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <span className="text-green-600">🏥</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Medical Information</h3>
                </div>
                {docs.medicalInfo ? (
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{docs.medicalInfo}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-400">No medical information available</p>
                  </div>
                )}
              </div>

              {/* Room Information */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-xl">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Room Information</h3>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Room Number:</span>
                    <span className="text-gray-600 font-semibold">{docs.room || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Admitted:</span>
                    <span className="text-gray-600">
                      {docs.admittedAt ? new Date(docs.admittedAt).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                  {docs.dischargedAt && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Discharged:</span>
                      <span className="text-gray-600">
                        {new Date(docs.dischargedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Important Dates */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Important Dates</h3>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-600">
                      {docs.createdAt ? new Date(docs.createdAt).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <span className="text-gray-600">
                      {docs.updatedAt ? new Date(docs.updatedAt).toLocaleDateString() : 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No documentation available</h3>
              <p className="text-gray-600">Documentation will appear here when available</p>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
} 