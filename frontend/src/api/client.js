// Empty string = same-origin (Vercel proxy to backend). Local dev defaults to :3000.
const API_URL =
  process.env.REACT_APP_API_URL !== undefined
    ? process.env.REACT_APP_API_URL
    : process.env.NODE_ENV === 'production'
      ? ''
      : 'http://localhost:3000';

export function apiUrl(path) {
  return `${API_URL}${path}`;
}

export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}

export async function apiFetch(path, { token, method = 'GET', body, isFormData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(apiUrl(path), {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
