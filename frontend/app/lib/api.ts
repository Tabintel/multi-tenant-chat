// app/lib/api.ts
export async function login(email: string, password: string) {
  const res = await fetch('http://localhost:8080/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json();
}

export async function getStreamToken() {
  const res = await fetch('http://localhost:8080/stream/token', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch Stream token');
  const data = await res.json();
  return data.token;
}

export async function listChannels() {
  const res = await fetch('http://localhost:8080/channels', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch channels');
  return res.json();
}

export async function createChannel(name: string) {
  const res = await fetch('http://localhost:8080/channels', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create channel');
  return res.json();
}

export async function listUsers() {
  const res = await fetch('http://localhost:8080/users', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}
