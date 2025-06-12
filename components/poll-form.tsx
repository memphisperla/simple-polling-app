"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, Trash2, Lock, Globe, Calendar, Info } from "lucide-react"
import { createPoll } from "@/app/actions"
import { toast } from "sonner"
import PollSuccess from "@/components/poll-success"

// Generate or retrieve creator ID from localStorage
function getCreatorId(): string {
  if (typeof window === "undefined") return ""

  let creatorId = localStorage.getItem("polling-app-creator-id")
  if (!creatorId) {
    creatorId = "creator-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9)
    localStorage.setItem("polling-app-creator-id", creatorId)
  }
  return creatorId
}

export default function PollForm() {
  const [options, setOptions] = useState(["", ""])
  const [privacy, setPrivacy] = useState<"public" | "private">("public")
  const [expiryDate, setExpiryDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdPoll, setCreatedPoll] = useState<{
    id: string
    question: string
    accessCode?: string
  } | null>(null)
  const router = useRouter()

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // Add creator ID to form data
      formData.append("creatorId", getCreatorId())

      const result = await createPoll(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        // Store the created poll info instead of redirecting immediately
        setCreatedPoll({
          id: result.pollId!,
          question: formData.get("question") as string,
          accessCode: result.accessCode,
        })

        if (result.accessCode) {
          toast.success(`Poll created successfully! Access code: ${result.accessCode}`, { duration: 10000 })
        } else {
          toast.success("Poll created successfully!")
        }
      }
    } catch (error) {
      toast.error("Failed to create poll")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  // Show success page if poll was created
  if (createdPoll) {
    return <PollSuccess pollId={createdPoll.id} question={createdPoll.question} accessCode={createdPoll.accessCode} />
  }

  // Otherwise show the form (keep existing form JSX)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Poll Details</CardTitle>
        <CardDescription asChild>
          <div>Enter your question, set privacy, and configure expiration</div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Poll Question *</Label>
            <Textarea
              id="question"
              name="question"
              placeholder="What's your question?"
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Answer Options *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption} disabled={options.length >= 6}>
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  name="option"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1"
                  required
                />
                {options.length > 2 && (
                  <Button type="button" variant="outline" size="icon" onClick={() => removeOption(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Label>Privacy Setting *</Label>
            <RadioGroup value={privacy} onValueChange={(value: "public" | "private") => setPrivacy(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                  <Globe className="w-4 h-4" />
                  Public - Anyone can see and vote
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                  <Lock className="w-4 h-4" />
                  Private - Only people with access code can participate
                </Label>
              </div>
            </RadioGroup>
            <input type="hidden" name="privacy" value={privacy} />

            {privacy === "private" && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Private Poll</p>
                    <p>An access code will be generated that you can share with specific people.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiry Date (Optional)
            </Label>
            <Input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={minDate}
            />
            <p className="text-xs text-gray-500">
              Leave empty for polls that never expire. Expired polls will stop accepting votes.
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/")} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Creating..." : "Create Poll"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
