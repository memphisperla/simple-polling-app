"use client"

import { useState, useEffect } from "react"
import { getPolls, type Poll } from "@/app/actions"
import PollCard from "@/components/poll-card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

// Get user ID from localStorage
function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem("polling-app-user-id")
  if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    localStorage.setItem("polling-app-user-id", userId)
  }
  return userId
}

// Get stored access codes
function getAccessCodes(): string[] {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("poll-access-codes") || "[]")
}

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [accessCodes, setAccessCodes] = useState<string[]>([])

  const fetchPolls = async (showRefreshToast = false) => {
    try {
      const userId = getUserId()
      const codes = getAccessCodes()
      setAccessCodes(codes)

      const fetchedPolls = await getPolls(userId, codes)
      setPolls(fetchedPolls)

      if (showRefreshToast) {
        toast.success("Polls refreshed!")
      }
    } catch (error) {
      console.error("Error fetching polls:", error)
      toast.error("Failed to fetch polls")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPolls()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchPolls(true)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-lg border p-6">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {polls.length} {polls.length === 1 ? "Poll" : "Polls"} Found
        </h2>
        <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh All
        </Button>
      </div>

      {polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No polls available.</p>
          <p className="text-gray-400 mt-2">Create your first poll to get started!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} userAccessCodes={accessCodes} />
          ))}
        </div>
      )}
    </div>
  )
}
