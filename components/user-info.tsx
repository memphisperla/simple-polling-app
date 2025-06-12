"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, RefreshCw, Key, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function UserInfo() {
  const [userId, setUserId] = useState<string>("")
  const [creatorId, setCreatorId] = useState<string>("")
  const [accessCodes, setAccessCodes] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get or create user ID
      let id = localStorage.getItem("polling-app-user-id")
      if (!id) {
        id = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
        localStorage.setItem("polling-app-user-id", id)
      }
      setUserId(id)

      // Get or create creator ID
      let cId = localStorage.getItem("polling-app-creator-id")
      if (!cId) {
        cId = "creator-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
        localStorage.setItem("polling-app-creator-id", cId)
      }
      setCreatorId(cId)

      // Get stored access codes
      const codes = JSON.parse(localStorage.getItem("poll-access-codes") || "[]")
      setAccessCodes(codes)
    }
  }, [])

  const resetUserId = () => {
    if (typeof window !== "undefined") {
      const newId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("polling-app-user-id", newId)
      setUserId(newId)
      toast.success("User ID reset! You can now vote on polls again.")
    }
  }

  const resetCreatorId = () => {
    if (typeof window !== "undefined") {
      const newId = "creator-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
      localStorage.setItem("polling-app-creator-id", newId)
      setCreatorId(newId)
      toast.success("Creator ID reset!")
    }
  }

  const clearAccessCodes = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("poll-access-codes")
      setAccessCodes([])
      toast.success("Access codes cleared!")
    }
  }

  if (!userId) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Your Identity & Access
        </CardTitle>
        <CardDescription>Manage your voting identity and private poll access</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Voter ID:</span>
            <Button variant="outline" size="sm" onClick={resetUserId}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">{userId}</div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Creator ID:</span>
            <Button variant="outline" size="sm" onClick={resetCreatorId}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">{creatorId}</div>
        </div>

        {accessCodes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Private Poll Access Codes:</span>
              <Button variant="outline" size="sm" onClick={clearAccessCodes}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>
            <div className="space-y-1">
              {accessCodes.map((code, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">{code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Your IDs are stored locally and used to track poll ownership and voting. Access codes are saved when you
          successfully access private polls.
        </p>
      </CardContent>
    </Card>
  )
}
