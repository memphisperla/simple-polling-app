import PollViewer from "@/components/poll-viewer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface PollPageProps {
  params: { id: string }
  searchParams: { code?: string }
}

export default async function PollPage({ params, searchParams }: PollPageProps) {
  // For server-side rendering, we'll pass the poll ID and access code to the client component
  // The client component will handle the actual poll fetching and access control

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link href="/polls">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Polls
            </Button>
          </Link>
        </div>

        <PollViewer pollId={params.id} accessCode={searchParams.code} />
      </div>
    </div>
  )
}
