"use server"

import { revalidatePath } from "next/cache"

export interface Poll {
  id: string
  question: string
  options: string[]
  votes: number[]
  createdAt: Date
}

// In-memory storage (in a real app, you'd use a database)
const polls: Poll[] = []

export async function createPoll(formData: FormData) {
  const question = formData.get("question") as string
  const options = formData.getAll("option") as string[]

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

  // Create new poll
  const newPoll: Poll = {
    id: Date.now().toString(),
    question: question.trim(),
    options: validOptions.map((option) => option.trim()),
    votes: new Array(validOptions.length).fill(0),
    createdAt: new Date(),
  }

  polls.push(newPoll)
  revalidatePath("/polls")

  return { success: true, pollId: newPoll.id }
}

export async function getPolls(): Promise<Poll[]> {
  return polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function votePoll(pollId: string, optionIndex: number) {
  const poll = polls.find((p) => p.id === pollId)
  if (!poll) {
    return { error: "Poll not found" }
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return { error: "Invalid option" }
  }

  poll.votes[optionIndex]++
  revalidatePath("/polls")

  return { success: true }
}
