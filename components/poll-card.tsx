"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { votePoll, hasUserVoted, refreshPollData, type Poll } from "@/app/actions"
import { toast } from "sonner"
import { Lock, Globe, Calendar, Clock, Key, RefreshCw } from "lucide-react"
import PollShareButton from "@/components/poll-share-button"

interface PollCardProps {
  poll: Poll
  userAccessCodes?: string[]
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

// Get creator ID from localStorage
function getCreatorId(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("polling-app-creator-id") || ""
}

export default function PollCard({ poll: initialPoll, userAccessCodes = [] }: PollCardProps) {
  const [poll, setPoll] = useState<Poll>(initialPoll)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isCheckingVote, setIsCheckingVote] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [userId, setUserId] = useState<string>("")
  const [accessCode, setAccessCode] = useState<string>("")
  const [showAccessInput, setShowAccessInput] = useState(false)
  const [isExpired, setIsExpired] = useState(false)
  const [isCreator, setIsCreator] = useState(false)

  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0)

  useEffect(() => {
    const id = getUserId()
    const creatorId = getCreatorId()
    setUserId(id)
    setIsCreator(poll.creatorId === creatorId)

    // Check if poll is expired
    if (poll.expiryDate) {
      setIsExpired(new Date() > new Date(poll.expiryDate))
    }

    // Check if user has access to private poll
    if (poll.privacy === "private" && !isCreator) {
      const hasAccess = poll.accessCode && userAccessCodes.includes(poll.accessCode)
      if (!hasAccess) {
        setShowAccessInput(true)
        setIsCheckingVote(false)
        return
      }
    }

    // Check if user has already voted
    const checkVoteStatus = async () => {
      try {
        const voted = await hasUserVoted(poll.id, id)
        setHasVoted(voted)
      } catch (error) {
        console.error("Error checking vote status:", error)
      } finally {
        setIsCheckingVote(false)
      }
    }

    checkVoteStatus()
  }, [poll.id, poll.creatorId, poll.privacy, poll.accessCode, userAccessCodes])

  const refreshPoll = async () => {
    setIsRefreshing(true)
    try {
      const updatedPoll = await refreshPollData(poll.id)
      if (updatedPoll) {
        setPoll(updatedPoll)
        toast.success("Poll data refreshed!")
      }
    } catch (error) {
      toast.error("Failed to refresh poll data")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || !userId) return

    setIsVoting(true)
    try {
      const result = await votePoll(
        poll.id,
        Number.parseInt(selectedOption),
        userId,
        poll.privacy === "private" ? poll.accessCode : undefined,
      )

      if (result.error) {
        toast.error(result.error)
      } else {
        setHasVoted(true)
        toast.success("Vote recorded!")

        // Refresh poll data to show updated results
        const updatedPoll = await refreshPollData(poll.id)
        if (updatedPoll) {
          setPoll(updatedPoll)
        }
      }
    } catch (error) {
      toast.error("Failed to record vote")
    } finally {
      setIsVoting(false)
    }
  }

  const handleAccessSubmit = () => {
    if (accessCode === poll.accessCode) {
      setShowAccessInput(false)
      toast.success("Access granted!")

      // Store access code for future use
      const storedCodes = JSON.parse(localStorage.getItem("poll-access-codes") || "[]")
      if (!storedCodes.includes(accessCode)) {
        storedCodes.push(accessCode)
        localStorage.setItem("poll-access-codes", JSON.stringify(storedCodes))
      }
    } else {
      toast.error("Invalid access code")
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  const getTimeUntilExpiry = () => {
    if (!poll.expiryDate) return null

    const now = new Date()
    const expiry = new Date(poll.expiryDate)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`
    return "Less than 1 hour left"
  }

  if (isCheckingVote) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{poll.question}</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showAccessInput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Private Poll
          </CardTitle>
          <CardDescription>This poll requires an access code to participate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessCode">Enter Access Code</Label>
              <div className="flex gap-2">
                <Input
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="Enter code..."
                  className="flex-1"
                />
                <Button onClick={handleAccessSubmit} disabled={!accessCode}>
                  <Key className="w-4 h-4 mr-2" />
                  Access
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isExpired ? "opacity-75" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl flex-1">{poll.question}</CardTitle>
          <div className="flex gap-2 ml-4">
            <Badge variant={poll.privacy === "public" ? "default" : "secondary"}>
              {poll.privacy === "public" ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">
                <Clock className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={refreshPoll} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <PollShareButton pollId={poll.id} question={poll.question} accessCode={poll.accessCode} />
          </div>
        </div>
        <CardDescription asChild>
          <div>
            <div className="space-y-1">
              <div>
                Created on {formatDate(poll.createdAt)} • {totalVotes} total votes
              </div>
              {poll.expiryDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {isExpired ? (
                    <span className="text-red-600">Expired on {formatDate(poll.expiryDate)}</span>
                  ) : (
                    <span>
                      Expires {formatDate(poll.expiryDate)} • {getTimeUntilExpiry()}
                    </span>
                  )}
                </div>
              )}
              {hasVoted && <span className="text-green-600">• You have voted</span>}
              {isCreator && <span className="text-blue-600">• You created this poll</span>}
              {poll.privacy === "private" && isCreator && (
                <div className="text-xs bg-blue-50 p-2 rounded mt-2">
                  <strong>Access Code:</strong> {poll.accessCode}
                </div>
              )}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasVoted && !isExpired ? (
          <div className="space-y-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {poll.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`${poll.id}-${index}`} />
                  <Label htmlFor={`${poll.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleVote} disabled={!selectedOption || isVoting} className="w-full">
              {isVoting ? "Voting..." : "Vote"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-gray-700">Results:</h4>
              {hasVoted && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">You voted on this poll</span>
              )}
            </div>
            {poll.options.map((option, index) => {
              const votes = poll.votes[index]
              const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{option}</span>
                    <span className="text-gray-500">
                      {votes} votes ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
            <div className="text-xs text-gray-500 mt-4 p-3 bg-gray-50 rounded">
              {isExpired ? (
                <strong>This poll has expired and is no longer accepting votes.</strong>
              ) : (
                <>
                  <strong>Note:</strong> You can only vote once per poll. Thank you for participating!
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
