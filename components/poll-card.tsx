"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { votePoll, type Poll } from "@/app/actions"
import { toast } from "sonner"

interface PollCardProps {
  poll: Poll
}

export default function PollCard({ poll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState(false)
  const [isVoting, setIsVoting] = useState(false)

  const totalVotes = poll.votes.reduce((sum, votes) => sum + votes, 0)

  const handleVote = async () => {
    if (!selectedOption) return

    setIsVoting(true)
    try {
      const result = await votePoll(poll.id, Number.parseInt(selectedOption))

      if (result.error) {
        toast.error(result.error)
      } else {
        setHasVoted(true)
        toast.success("Vote recorded!")
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{poll.question}</CardTitle>
        <CardDescription>
          Created on {formatDate(poll.createdAt)} • {totalVotes} total votes
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
            <h4 className="font-medium text-sm text-gray-700">Results:</h4>
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}
