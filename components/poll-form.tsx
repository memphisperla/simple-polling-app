"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { createPoll } from "@/app/actions"
import { toast } from "sonner"

export default function PollForm() {
  const [options, setOptions] = useState(["", ""])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const result = await createPoll(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Poll created successfully!")
        router.push("/polls")
      }
    } catch (error) {
      toast.error("Failed to create poll")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Poll Details</CardTitle>
        <CardDescription>Enter your question and provide at least 2 answer options</CardDescription>
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
