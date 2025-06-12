"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function UserInfo() {
  const [userId, setUserId] = useState<string>("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      let id = localStorage.getItem("polling-app-user-id")
      if (!id) {
        id = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
        localStorage.setItem("polling-app-user-id", id)
      }
      setUserId(id)
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

  if (!userId) return null

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          Your Voting Identity
        </CardTitle>
        <CardDescription>Each browser session gets a unique ID to prevent duplicate voting</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">{userId}</div>
          <Button variant="outline" size="sm" onClick={resetUserId}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset ID
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          This ID is stored in your browser and used to track your votes. Resetting it will allow you to vote again (for
          testing purposes).
        </p>
      </CardContent>
    </Card>
  )
}
