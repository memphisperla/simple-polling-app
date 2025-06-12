"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { QrCode, Copy, Download, Share2, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface QRCodeGeneratorProps {
  pollId: string
  accessCode?: string
  question: string
}

export default function QRCodeGenerator({ pollId, accessCode, question }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [shareableLink, setShareableLink] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Generate shareable link
    const baseUrl = window.location.origin
    const link = accessCode ? `${baseUrl}/poll/${pollId}?code=${accessCode}` : `${baseUrl}/poll/${pollId}`

    setShareableLink(link)

    // Generate QR code
    generateQRCode(link)
  }, [pollId, accessCode])

  const generateQRCode = async (url: string) => {
    try {
      // Using QR Server API for QR code generation (free service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
      setQrCodeUrl(qrUrl)

      // Also generate canvas version for download
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = 200
          canvas.height = 200
          ctx?.drawImage(img, 0, 0, 200, 200)
        }
        img.src = qrUrl
      }
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Failed to generate QR code")
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      toast.success("Link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = `poll-${pollId}-qr.png`
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Poll: ${question}`,
          text: `Vote on this poll: ${question}`,
          url: shareableLink,
        })
      } catch (error) {
        // User cancelled sharing or sharing failed
        copyLink() // Fallback to copying
      }
    } else {
      copyLink() // Fallback for browsers without native sharing
    }
  }

  const openPoll = () => {
    window.open(shareableLink, "_blank")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Share Your Poll
        </CardTitle>
        <CardDescription asChild>
          <div>Share this QR code and link to let others access your poll</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex flex-col items-center space-y-4">
          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="Poll QR Code" className="w-48 h-48" />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" width={200} height={200} />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadQRCode}>
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button variant="outline" size="sm" onClick={shareNative}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Shareable Link */}
        <div className="space-y-2">
          <Label htmlFor="shareableLink">Shareable Link</Label>
          <div className="flex gap-2">
            <Input id="shareableLink" value={shareableLink} readOnly className="flex-1 font-mono text-sm" />
            <Button variant="outline" size="icon" onClick={copyLink}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={openPoll}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to share:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • <strong>QR Code:</strong> Others can scan with their phone camera
            </li>
            <li>
              • <strong>Link:</strong> Copy and paste in messages, emails, or social media
            </li>
            {accessCode && (
              <li>
                • <strong>Private Poll:</strong> Access code is included in the link
              </li>
            )}
            <li>
              • <strong>Direct Access:</strong> No additional steps needed for voters
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
