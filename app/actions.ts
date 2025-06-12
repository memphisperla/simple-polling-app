"use server"

import { revalidatePath } from "next/cache"
import { supabase } from "@/lib/supabase"

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

// Convert database row to Poll interface
function dbRowToPoll(row: any): Poll {
  return {
    id: row.id,
    question: row.question,
    options: row.options,
    votes: row.votes,
    voters: row.voters,
    createdAt: new Date(row.created_at),
    expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
    privacy: row.privacy,
    creatorId: row.creator_id,
    accessCode: row.access_code,
  }
}

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
  let parsedExpiryDate: string | null = null
  if (expiryDate) {
    const expiry = new Date(expiryDate)
    if (expiry <= new Date()) {
      return { error: "Expiry date must be in the future" }
    }
    parsedExpiryDate = expiry.toISOString()
  }

  // Generate access code for private polls
  const accessCode = privacy === "private" ? Math.random().toString(36).substr(2, 8).toUpperCase() : null

  try {
    // Insert poll into database
    const { data, error } = await supabase
      .from("polls")
      .insert({
        question: question.trim(),
        options: validOptions.map((option) => option.trim()),
        votes: new Array(validOptions.length).fill(0),
        voters: [],
        expiry_date: parsedExpiryDate,
        privacy,
        creator_id: creatorId,
        access_code: accessCode,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return { error: "Failed to create poll. Please try again." }
    }

    revalidatePath("/polls")

    return {
      success: true,
      pollId: data.id,
      accessCode: accessCode,
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getPolls(userId: string, accessCodes: string[] = []): Promise<Poll[]> {
  try {
    const query = supabase.from("polls").select("*").order("created_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return []
    }

    if (!data) return []

    // Filter polls based on privacy and access
    const filteredPolls = data.filter((poll) => {
      // Show public polls to everyone
      if (poll.privacy === "public") return true

      // Show private polls to creator
      if (poll.creator_id === userId) return true

      // Show private polls if user has access code
      if (poll.access_code && accessCodes.includes(poll.access_code)) return true

      return false
    })

    return filteredPolls.map(dbRowToPoll)
  } catch (error) {
    console.error("Unexpected error:", error)
    return []
  }
}

export async function getPollById(pollId: string, userId: string, accessCode?: string): Promise<Poll | null> {
  try {
    const { data, error } = await supabase.from("polls").select("*").eq("id", pollId).single()

    if (error || !data) {
      return null
    }

    // Check access permissions
    if (data.privacy === "private") {
      if (data.creator_id !== userId && data.access_code !== accessCode) {
        return null
      }
    }

    return dbRowToPoll(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return null
  }
}

export async function votePoll(pollId: string, optionIndex: number, userId: string, accessCode?: string) {
  try {
    // First, get the current poll data
    const { data: pollData, error: fetchError } = await supabase.from("polls").select("*").eq("id", pollId).single()

    if (fetchError || !pollData) {
      return { error: "Poll not found" }
    }

    // Check access permissions
    if (pollData.privacy === "private") {
      if (pollData.creator_id !== userId && pollData.access_code !== accessCode) {
        return { error: "Access denied. Invalid access code." }
      }
    }

    // Check if poll has expired
    if (pollData.expiry_date && new Date() > new Date(pollData.expiry_date)) {
      return { error: "This poll has expired and is no longer accepting votes" }
    }

    if (optionIndex < 0 || optionIndex >= pollData.options.length) {
      return { error: "Invalid option" }
    }

    // Check if user has already voted
    if (pollData.voters.includes(userId)) {
      return { error: "You have already voted on this poll" }
    }

    // Update votes and voters
    const newVotes = [...pollData.votes]
    newVotes[optionIndex]++
    const newVoters = [...pollData.voters, userId]

    // Update the poll in the database
    const { error: updateError } = await supabase
      .from("polls")
      .update({
        votes: newVotes,
        voters: newVoters,
      })
      .eq("id", pollId)

    if (updateError) {
      console.error("Database error:", updateError)
      return { error: "Failed to record vote. Please try again." }
    }

    revalidatePath("/polls")
    revalidatePath(`/poll/${pollId}`)

    return { success: true }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function hasUserVoted(pollId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("polls").select("voters").eq("id", pollId).single()

    if (error || !data) {
      return false
    }

    return data.voters.includes(userId)
  } catch (error) {
    console.error("Unexpected error:", error)
    return false
  }
}

export async function verifyAccessCode(pollId: string, accessCode: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("polls").select("access_code").eq("id", pollId).single()

    if (error || !data) {
      return false
    }

    return data.access_code === accessCode
  } catch (error) {
    console.error("Unexpected error:", error)
    return false
  }
}

// Helper function to get real-time poll data
export async function refreshPollData(pollId: string): Promise<Poll | null> {
  try {
    const { data, error } = await supabase.from("polls").select("*").eq("id", pollId).single()

    if (error || !data) {
      return null
    }

    return dbRowToPoll(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return null
  }
}
