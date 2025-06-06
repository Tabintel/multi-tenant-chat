"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { login as apiLogin, register as apiRegister } from "@/app/lib/api";

interface User {
  id: string
  name: string
  email?: string
  role: string
  tenantId: string
  tenantName: string
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  org_name?: string;
  tenant_id?: string;
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string, tenantId: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
  register: (data: RegisterData) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  isAuthenticated: false,
  hasPermission: () => false,
  register: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)

        const storedToken = localStorage.getItem("token")
        const storedUser = localStorage.getItem("user")

        if (storedToken && storedUser) {
          try {
            const userData = JSON.parse(storedUser)
            setToken(storedToken)
            setUser({
              id: userData.id || `user-${Math.floor(Math.random() * 1000)}`,
              name: userData.name || "Anonymous User",
              email: userData.email,
              role: userData.role || "member",
              tenantId: userData.organization || userData.tenantId || "tenant-a",
              tenantName: formatTenantName(userData.organization || userData.tenantId || "tenant-a"),
            })

            // Connect to Stream Chat (commented out for demo)
            /*
            try {
              await connectUser({
                id: userData.id,
                name: userData.name,
                role: userData.role,
                tenantId: userData.tenantId,
              });
            } catch (error) {
              console.error('Error connecting to Stream Chat:', error);
            }
            */
          } catch (error) {
            console.error("Error parsing user data:", error)
            clearAuthData()
          }
        } else {
          clearAuthData()
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        clearAuthData()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Cleanup on unmount
    return () => {
      // disconnectUser();
    }
  }, [])

  const clearAuthData = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  const login = async (email: string, password: string, tenantId: string) => {
    try {
      setIsLoading(true)
      // Call backend API
      const res = await apiLogin(email, password)
      if (!res.token || !res.user) throw new Error('Invalid login response')
      localStorage.setItem("token", res.token)
      localStorage.setItem("user", JSON.stringify(res.user))
      setToken(res.token)
      setUser(res.user)
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    const res = await apiRegister(data)
    // Optionally auto-login after registration:
    // await login(data.email, data.password, data.tenant_id || "")
    return res
  };

  const logout = async () => {
    try {
      setIsLoading(true)

      // Call logout API (commented out for demo)
      // await authApi.logout();

      // Disconnect from Stream Chat (commented out for demo)
      // await disconnectUser();

      // Clear local storage
      clearAuthData()

      // Redirect to login
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    // Admin role has all permissions
    if (user.role === "admin") return true

    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ["manage_users", "manage_channels", "manage_tenant", "view_members", "send_messages"],
      moderator: ["manage_channels", "view_members", "send_messages"],
      member: ["view_members", "send_messages"],
      guest: ["send_messages"],
    }

    return rolePermissions[user.role]?.includes(permission) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated: !!user,
        hasPermission,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Helper function to format tenant name
function formatTenantName(tenantId: string): string {
  return tenantId.replace("tenant-", "Tenant ").toUpperCase()
}
