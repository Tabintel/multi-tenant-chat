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

export async function listUsers(jwt: string) {
  const res = await fetch('http://localhost:8080/users', {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function register({ name, email, password, role, org_name }: { name: string; email: string; password: string; role: string; org_name?: string }) {
  const res = await fetch('http://localhost:8080/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role, org_name })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Registration failed');
  }
  return res.json();
}

export async function sendMessage(stream_id: string, text: string, jwt: string) {
  const res = await fetch(`http://localhost:8080/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ stream_id, text })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export async function getMessages(stream_id: string, jwt: string) {
  const res = await fetch(`http://localhost:8080/messages/${stream_id}`, {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return res.json();
}

export async function listTenants(jwt: string) {
  const res = await fetch('http://localhost:8080/tenants', {
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch tenants');
  return res.json();
}

export async function createTenant(name: string, jwt: string) {
  const res = await fetch('http://localhost:8080/tenants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify({ name })
  });
  if (!res.ok) throw new Error('Failed to create tenant');
  return res.json();
}
