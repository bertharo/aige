// Local dev: empty string → CRA proxy to localhost:3000 (see package.json "proxy").
// Production (Vercel): defaults to Render API unless REACT_APP_API_URL is set.
// Optional: set KINNESS_BACKEND_URL at Vercel build time for same-origin /api proxy instead.
const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://aige-backend.onrender.com' : '');

const REQUEST_TIMEOUT_MS = 20000;

export function apiUrl(path) {
  const base = API_URL.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}

export function photoUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return apiUrl(path);
}

async function parseJsonResponse(res) {
  const text = await res.text();
  if (!text) return {};

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/html') || text.trimStart().startsWith('<!')) {
    throw new Error(
      'Could not reach the Kinness server. If you are hosting the app, set KINNESS_BACKEND_URL on Vercel. For local dev, run the backend on port 3000.'
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server');
  }
}

export async function apiFetch(path, { token, method = 'GET', body, isFormData } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isFormData) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res;
  try {
    res = await fetch(apiUrl(path), {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      const hint =
        API_URL.includes('localhost') || !API_URL
          ? 'Start the backend: cd backend && npm run dev'
          : `Check that the API is reachable at ${API_URL || 'your configured API URL'}`;
      throw new Error(`Request timed out — ${hint}`);
    }
    const target = apiUrl(path);
    throw new Error(`Could not connect to ${target}. Check your network and API settings.`);
  } finally {
    clearTimeout(timeoutId);
  }

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}
