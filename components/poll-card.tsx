"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { votePoll, hasUserVoted, type Poll } from "@/app/actions"
import { toast } from "sonner"

interface PollCardProps {
  poll: Poll
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

export default function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [isCheckingVote, setIsCheckingVote] = useState(true)
  const [userId, setUserId] = useState<string>("")

  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0)

  useEffect(() => {
    const id = getUserId()
    setUserId(id)

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
  }, [poll.id])

  const handleVote = async () => {
    if (!selectedOption || !userId) return

    setIsVoting(true)
    try {
      const result = await votePoll(poll.id, Number.parseInt(selectedOption), userId)

      if (result.error) {
        toast.error(result.error)
      } else {
        setHasVoted(true)
        toast.success("Vote recorded!")
        // Refresh the page to show updated results
        window.location.reload()
      }
    } catch (error) {
      toast.error("Failed to record vote")
    } finally {
      setIsVoting(false)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{poll.question}</CardTitle>
        <CardDescription>
          Created on {formatDate(poll.createdAt)} • {totalVotes} total votes
          {hasVoted && <span className="text-green-600 ml-2">• You have voted</span>}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasVoted ? (
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
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">You voted on this poll</span>
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
              <strong>Note:</strong> You can only vote once per poll. Thank you for participating!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
