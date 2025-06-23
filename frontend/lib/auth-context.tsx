"use client"

import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "./types"
import { API_BASE_URL } from "./api"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>
  isAuthenticated: boolean
  token: string | null
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

    const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("library-user", JSON.stringify(updatedUser))
  }

  useEffect(() => {
    const storedToken = localStorage.getItem("library-token")
    const storedUser = localStorage.getItem("library-user")
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error("Login failed")
      }

      const data = await response.json()
      setToken(data.token)
      localStorage.setItem("library-token", data.token)

      const profileResponse = await fetch(`${API_BASE_URL}/auth/profile/`, {
        headers: { Authorization: `Bearer ${data.token}` }
      })

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch profile")
      }

      const userData = await profileResponse.json()
      setUser(userData)
      localStorage.setItem("library-user", JSON.stringify(userData))

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("library-token")
    localStorage.removeItem("library-user")
  }

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          username: email // Using email as username
        })
      })

      if (!response.ok) {
        throw new Error("Registration failed")
      }

      return await login(email, password)
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        token,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}