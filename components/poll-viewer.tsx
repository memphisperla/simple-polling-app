"use client"

import { useState, useEffect } from "react"
import { getPollById, type Poll } from "@/app/actions"
import PollCard from "@/components/poll-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface PollViewerProps {
  pollId: string
  accessCode?: string
}

// Generate or retrieve user ID from localStorage
function getUserId(): string {
  if (typeof window === "undefined") return ""

  let userId = localStorage.getItem("polling-app-user-id")
  if (!userId) {
    userId = "user-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    localStorage.setItem("polling-app-user-id", userId)
  }
  return userId
}

export default function PollViewer({ pollId, accessCode }: PollViewerProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const userId = getUserId()
        const fetchedPoll = await getPollById(pollId, userId, accessCode)

        if (!fetchedPoll) {
          setError("Poll not found or access denied")
        } else {
          setPoll(fetchedPoll)

          // Store access code if provided and poll is private
          if (accessCode && fetchedPoll.privacy === "private") {
            const storedCodes = JSON.parse(localStorage.getItem("poll-access-codes") || "[]")
            if (!storedCodes.includes(accessCode)) {
              storedCodes.push(accessCode)
              localStorage.setItem("poll-access-codes", JSON.stringify(storedCodes))
            }
          }
        }
      } catch (error) {
        console.error("Error fetching poll:", error)
        setError("Failed to load poll")
      } finally {
        setLoading(false)
      }
    }

    fetchPoll()
  }, [pollId, accessCode])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg border p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Poll Not Available
          </CardTitle>
          <CardDescription>
            {error || "The poll you're looking for doesn't exist or you don't have permission to view it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            If this is a private poll, make sure you have the correct access code in the URL.
          </p>
        </CardContent>
      </Card>
    )
  }

  return <PollCard poll={poll} userAccessCodes={accessCode ? [accessCode] : []} />
}
