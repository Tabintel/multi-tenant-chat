// API service for interacting with the Go backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

// Helper function for making authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from localStorage
  const token = localStorage.getItem("token")

  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  // Make the request
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  // Handle unauthorized responses
  if (response.status === 401) {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/"
    throw new Error("Unauthorized")
  }

  // Parse JSON response
  const data = await response.json()

  // Handle error responses
  if (!response.ok) {
    throw new Error(data.error || "Something went wrong")
  }

  return data
}

// Auth API
export const authApi = {
  login: async (email: string, password: string, tenantId: string) => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, tenant_id: tenantId }),
    })
  },

  register: async (userData: {
    name: string
    email: string
    password: string
    tenant_id: string
    tenant_name?: string
    create_tenant: boolean
  }) => {
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  getChatToken: async () => {
    return fetchWithAuth("/auth/chat-token")
  },

  logout: async () => {
    return fetchWithAuth("/auth/logout", {
      method: "POST",
    })
  },
}

// Tenant API
export const tenantApi = {
  getTenants: async () => {
    return fetchWithAuth("/tenants")
  },

  getTenant: async (id: string) => {
    return fetchWithAuth(`/tenants/${id}`)
  },

  createTenant: async (data: { name: string }) => {
    return fetchWithAuth("/tenants", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  updateTenant: async (id: string, data: { name?: string; description?: string; website?: string }) => {
    return fetchWithAuth(`/tenants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Channel API
export const channelApi = {
  getChannels: async () => {
    return fetchWithAuth("/channels")
  },

  getChannel: async (id: string) => {
    return fetchWithAuth(`/channels/${id}`)
  },

  createChannel: async (data: { name: string; description: string }) => {
    return fetchWithAuth("/channels", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  updateChannel: async (id: string, data: { name?: string; description?: string }) => {
    return fetchWithAuth(`/channels/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteChannel: async (id: string) => {
    return fetchWithAuth(`/channels/${id}`, {
      method: "DELETE",
    })
  },

  addUserToChannel: async (channelId: string, userId: string) => {
    return fetchWithAuth(`/channels/${channelId}/members`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    })
  },

  removeUserFromChannel: async (channelId: string, userId: string) => {
    return fetchWithAuth(`/channels/${channelId}/members/${userId}`, {
      method: "DELETE",
    })
  },
}

// User API
export const userApi = {
  getUsers: async () => {
    return fetchWithAuth("/users")
  },

  getUser: async (id: string) => {
    return fetchWithAuth(`/users/${id}`)
  },

  updateUser: async (id: string, data: { name?: string; email?: string; role?: string }) => {
    return fetchWithAuth(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (id: string) => {
    return fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    })
  },

  changePassword: async (id: string, data: { current_password: string; new_password: string }) => {
    return fetchWithAuth(`/users/${id}/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

