"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Share2 } from "lucide-react"
import QRCodeGenerator from "@/components/qr-code-generator"

interface PollShareButtonProps {
  pollId: string
  question: string
  accessCode?: string
}

export default function PollShareButton({ pollId, question, accessCode }: PollShareButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Poll</DialogTitle>
          <DialogDescription>Share this poll with others using the QR code or link below</DialogDescription>
        </DialogHeader>
        <QRCodeGenerator pollId={pollId} question={question} accessCode={accessCode} />
      </DialogContent>
    </Dialog>
  )
}
