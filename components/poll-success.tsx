"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Eye, ArrowRight } from "lucide-react"
import QRCodeGenerator from "@/components/qr-code-generator"
import Link from "next/link"

interface PollSuccessProps {
  pollId: string
  question: string
  accessCode?: string
}

export default function PollSuccess({ pollId, question, accessCode }: PollSuccessProps) {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Poll Created Successfully!
          </CardTitle>
          <CardDescription className="text-green-700">
            Your poll "{question}" is now live and ready for votes.
            {accessCode && (
              <span className="block mt-1 font-medium">
                Access Code: <code className="bg-green-100 px-2 py-1 rounded">{accessCode}</code>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href={`/poll/${pollId}${accessCode ? `?code=${accessCode}` : ""}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Poll
              </Button>
            </Link>
            <Link href="/polls">
              <Button size="sm">
                <ArrowRight className="w-4 h-4 mr-2" />
                View All Polls
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* QR Code and Sharing */}
      <QRCodeGenerator pollId={pollId} accessCode={accessCode} question={question} />
    </div>
  )
}
