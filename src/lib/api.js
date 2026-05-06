const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export function getToken() {
  return localStorage.getItem('travelwise_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('travelwise_token', token);
  else localStorage.removeItem('travelwise_token');
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, body) => apiRequest(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => apiRequest(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};

export function normalizePlace(place) {
  if (!place) return place;
  const id = place.id || place._id;
  const title = place.title || place.name || '';
  const image = place.image || place.images?.[0] || '';
  const reviewCount = place.reviewCount ?? place.review_count ?? 0;
  const rawDuration = place.estimatedVisitTime ?? place.estimated_duration ?? '';
  const duration = typeof rawDuration === 'string' ? Number(rawDuration.replace(/[^0-9.]/g, '')) || rawDuration : rawDuration;
  const categoryName = typeof place.category === 'string' ? place.category : place.category?.name;
  return {
    ...place,
    id,
    _id: id,
    name: title,
    title,
    images: place.images || (image ? [image] : []),
    image,
    review_count: reviewCount,
    reviewCount,
    estimated_duration: duration ? `${duration}${typeof duration === 'number' ? 'h' : ''}` : '',
    estimatedVisitTime: duration,
    category: categoryName ? { id: categoryName, name: categoryName } : place.category,
    category_id: categoryName,
    opening_hours: place.openingHours,
  };
}

export function normalizeUser(user) {
  if (!user) return user;
  const id = user.id || user._id;
  return {
    ...user,
    id,
    _id: id,
    full_name: user.full_name || user.name || '',
    name: user.name || user.full_name || '',
    role: user.role || 'user',
  };
}
