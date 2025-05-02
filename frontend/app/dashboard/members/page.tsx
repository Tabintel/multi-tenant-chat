"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { userApi } from "@/lib/api"
import { getTenantUsers } from "@/lib/stream-chat"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { Loader2, MoreHorizontal, Shield, User } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Member {
  id: string
  name: string
  role: string
  status: string
  lastActive: string
}

export default function MembersPage() {
  const { user, hasPermission } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [newRole, setNewRole] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  // Fetch members from backend for real tenants, fallback to mock for demo tenants
  const fetchMembers = async (tenantId: string, jwt: string) => {
    try {
      const res = await fetch(`http://localhost:8080/users`, {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      return data;
    } catch (e) {
      return getMockMembers(tenantId);
    }
  };

  useEffect(() => {
    if (!user) return;
    const jwt = localStorage.getItem('token') || '';
    const isMock = ["tenant-a", "tenant-b", "tenant-c"].includes(user.tenantId);
    const loadMembers = async () => {
      if (isMock) {
        setMembers(getMockMembers(user.tenantId));
      } else {
        const members = await fetchMembers(user.tenantId, jwt);
        setMembers(members);
      }
    };
    loadMembers();
  }, [user]);

  // Mock members for demo/fallback purposes
  const getMockMembers = (tenantId: string) => {
    const mockMembersByTenant: Record<string, Member[]> = {
      "tenant-a": [
        { id: "1", name: "Alice Johnson", role: "admin", status: "online", lastActive: "Now" },
        { id: "2", name: "Bob Smith", role: "member", status: "offline", lastActive: "2 hours ago" },
        { id: "3", name: "Charlie Davis", role: "member", status: "online", lastActive: "Now" },
        { id: "4", name: "Diana Miller", role: "moderator", status: "online", lastActive: "Now" },
        { id: "5", name: "Eve Wilson", role: "member", status: "offline", lastActive: "2 hours ago" },
      ],
      "tenant-b": [
        { id: "1", name: "John Anderson", role: "admin", status: "online", lastActive: "Now" },
        { id: "2", name: "Kate Brown", role: "member", status: "offline", lastActive: "2 hours ago" },
        { id: "3", name: "Liam Garcia", role: "moderator", status: "online", lastActive: "Now" },
      ],
      "tenant-c": [
        { id: "1", name: "Quinn Taylor", role: "admin", status: "online", lastActive: "Now" },
        { id: "2", name: "Rachel Clark", role: "member", status: "offline", lastActive: "2 hours ago" },
        { id: "3", name: "Sam Lewis", role: "member", status: "online", lastActive: "Now" },
      ],
    }

    return mockMembersByTenant[tenantId] || []
  }

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRole) return

    try {
      setIsUpdating(true)

      // Update user role via API
      await userApi.updateUser(selectedMember.id, { role: newRole })

      // Update local state
      setMembers(members.map((member) => (member.id === selectedMember.id ? { ...member, role: newRole } : member)))

      setIsDialogOpen(false)
      setSelectedMember(null)
      setNewRole("")

      toast({
        title: "Success",
        description: `Updated ${selectedMember.name}'s role to ${newRole}`,
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <ProtectedRoute requiredPermission="view_members">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Organization Members</h1>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">{user?.tenantName || "Organization"} Members</h3>
            <p className="text-sm text-muted-foreground">Manage members and their roles</p>
          </div>

          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    {hasPermission("manage_users") && <TableHead className="w-[100px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {member.role === "admin" && <Shield className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              member.status === "online" ? "bg-green-500" : "bg-gray-300"
                            }`}
                          />
                          <span className="capitalize">{member.status}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.lastActive}</TableCell>
                      {hasPermission("manage_users") && (
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedMember(member)
                                  setNewRole(member.role)
                                  setIsDialogOpen(true)
                                }}
                              >
                                Change Role
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Change Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember?.name}</p>
                  <p className="text-sm text-muted-foreground">Current role: {selectedMember?.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Role</label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="guest">Guest</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole} disabled={isUpdating}>
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Role"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}

// Helper function to get badge variant based on role
function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "admin":
      return "default"
    case "moderator":
      return "secondary"
    case "member":
      return "outline"
    case "guest":
      return "destructive"
    default:
      return "outline"
  }
}
