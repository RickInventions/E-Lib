"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Mail, BookOpen, Download, Clock, Save, Shield } from "lucide-react"
import { API_BASE_URL } from "@/lib/api"

export default function ProfilePage() {
  const { user, token, isAuthenticated, logout, updateUser } = useAuth()
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else if (user) {
      setProfileData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        username: user.username || user.email || ""
      })
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
        method: "PATCH", // Changed to PATCH for partial updates
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          email: profileData.email,
          username: profileData.username
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.detail || 
                           errorData.email?.[0] || 
                           errorData.username?.[0] ||
                           errorData.first_name?.[0] ||
                           errorData.last_name?.[0] ||
                           "Failed to update profile"
        throw new Error(errorMessage)
      }

      const updatedUser = await response.json()
      // Update auth context with new user data without requiring logout
      updateUser(updatedUser)
      setSuccess("Profile updated successfully!")
    } catch (error) {
      console.error("Profile update error:", error)
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long!")
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to change password")
      }

      setSuccess("Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Password change error:", error)
      setError(
        error instanceof Error ? error.message : "Failed to change password"
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
    }
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>
                  {user.first_name} {user.last_name}
                </CardTitle>
                <Badge variant={user.role === "admin" ? "destructive" : "default"}>
                  {user.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{user.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reading Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Library Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Books Read</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Downloads</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">0h</div>
                    <div className="text-sm text-gray-600">Reading Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Management */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Profile Info
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Password
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Update Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={profileData.first_name}
                            onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={profileData.last_name}
                            onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" disabled={isUpdating} className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        {isUpdating ? "Changing..." : "Change Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}