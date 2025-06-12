"use server"

import { revalidatePath } from "next/cache"

export interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
  voters: string[] // Track user IDs who have voted
  createdAt: Date
  expiryDate: Date | null // Poll expiration date
  privacy: "public" | "private" // Poll privacy setting
  creatorId: string // ID of poll creator
  accessCode?: string // Access code for private polls
}

// In-memory storage (in a real app, you'd use a database)
const polls: Poll[] = []

export async function createPoll(formData: FormData) {
  const question = formData.get("question") as string
  const options = formData.getAll("option") as string[]
  const privacy = formData.get("privacy") as "public" | "private"
  const expiryDate = formData.get("expiryDate") as string
  const creatorId = formData.get("creatorId") as string

  // Validation
  if (!question || question.trim().length === 0) {
    return { error: "Question is required" }
  }

  if (question.trim().length < 5) {
    return { error: "Question must be at least 5 characters long" }
  }

  const validOptions = options.filter((option) => option.trim().length > 0)

  if (validOptions.length < 2) {
    return { error: "At least 2 answer options are required" }
  }

  if (validOptions.some((option) => option.trim().length < 1)) {
    return { error: "All options must have at least 1 character" }
  }

  // Validate expiry date
  let parsedExpiryDate: Date | null = null
  if (expiryDate) {
    parsedExpiryDate = new Date(expiryDate)
    if (parsedExpiryDate <= new Date()) {
      return { error: "Expiry date must be in the future" }
    }
  }

  // Generate access code for private polls
  const accessCode = privacy === "private" ? Math.random().toString(36).substr(2, 8).toUpperCase() : undefined

  // Create new poll
  const newPoll: Poll = {
    id: Date.now().toString(),
    question: question.trim(),
    options: validOptions.map((option) => option.trim()),
    votes: new Array(validOptions.length).fill(0),
    voters: [],
    createdAt: new Date(),
    expiryDate: parsedExpiryDate,
    privacy,
    creatorId,
    accessCode,
  }

  polls.push(newPoll)
  revalidatePath("/polls")

  return {
    success: true,
    pollId: newPoll.id,
    accessCode: accessCode, // Return access code for private polls
  }
}

export async function getPolls(userId: string, accessCodes: string[] = []): Promise<Poll[]> {
  const now = new Date()

  return polls
    .filter((poll) => {
      // Show public polls to everyone
      if (poll.privacy === "public") return true

      // Show private polls to creator
      if (poll.creatorId === userId) return true

      // Show private polls if user has access code
      if (poll.accessCode && accessCodes.includes(poll.accessCode)) return true

      return false
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getPollById(pollId: string, userId: string, accessCode?: string): Promise<Poll | null> {
  const poll = polls.find((p) => p.id === pollId)
  if (!poll) return null

  // Check access permissions
  if (poll.privacy === "private") {
    if (poll.creatorId !== userId && poll.accessCode !== accessCode) {
      return null
    }
  }

  return poll
}

export async function votePoll(pollId: string, optionIndex: number, userId: string, accessCode?: string) {
  const poll = polls.find((p) => p.id === pollId)
  if (!poll) {
    return { error: "Poll not found" }
  }

  // Check access permissions
  if (poll.privacy === "private") {
    if (poll.creatorId !== userId && poll.accessCode !== accessCode) {
      return { error: "Access denied. Invalid access code." }
    }
  }

  // Check if poll has expired
  if (poll.expiryDate && new Date() > poll.expiryDate) {
    return { error: "This poll has expired and is no longer accepting votes" }
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return { error: "Invalid option" }
  }

  // Check if user has already voted
  if (poll.voters.includes(userId)) {
    return { error: "You have already voted on this poll" }
  }

  poll.votes[optionIndex]++
  poll.voters.push(userId)
  revalidatePath("/polls")

  return { success: true }
}

export async function hasUserVoted(pollId: string, userId: string): Promise<boolean> {
  const poll = polls.find((p) => p.id === pollId)
  return poll ? poll.voters.includes(userId) : false
}

export async function verifyAccessCode(pollId: string, accessCode: string): Promise<boolean> {
  const poll = polls.find((p) => p.id === pollId)
  return poll ? poll.accessCode === accessCode : false
}
