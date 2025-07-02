import React, { useState } from "react";

function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function getStrengthLabel(score) {
  switch (score) {
    case 5: return { label: "Strong", color: "bg-green-500" };
    case 4: return { label: "Good", color: "bg-yellow-400" };
    case 3: return { label: "Medium", color: "bg-orange-400" };
    default: return { label: "Weak", color: "bg-red-500" };
  }
}

export default function Register({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);
  const { label: strengthLabel, color: strengthColor } = getStrengthLabel(strength);
  const isStrong = strength === 5;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:3000"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      onRegister(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2 tracking-tight">AIGE Family Portal</h1>
          <p className="text-gray-500">Create your account to access updates</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 flex items-center gap-2">
              <div className={`h-2 w-24 rounded ${strengthColor}`}></div>
              <span className={`text-xs font-medium ${strength === 5 ? 'text-green-600' : strength >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{strengthLabel}</span>
            </div>
            <ul className="text-xs text-gray-500 mt-2 space-y-1">
              <li className={password.length >= 8 ? "text-green-600" : ""}>• At least 8 characters</li>
              <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• One uppercase letter</li>
              <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>• One lowercase letter</li>
              <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>• One number</li>
              <li className={/[^A-Za-z0-9]/.test(password) ? "text-green-600" : ""}>• One special character</li>
            </ul>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-60"
            disabled={loading || !isStrong}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <button className="text-indigo-600 hover:underline font-medium" onClick={onSwitchToLogin} type="button">
            Log in
          </button>
        </div>
      </div>
    </div>
  );
} 