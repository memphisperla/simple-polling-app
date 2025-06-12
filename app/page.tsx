import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple Polling App</h1>
          <p className="text-xl text-gray-600">Create polls and gather opinions from your audience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <PlusCircle className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle className="text-2xl">Create Poll</CardTitle>
              <CardDescription>Start a new poll with your question and answer options</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/create">
                <Button className="w-full" size="lg">
                  Create New Poll
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle className="text-2xl">View Polls</CardTitle>
              <CardDescription>Browse all created polls and see the results</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/polls">
                <Button variant="outline" className="w-full" size="lg">
                  View All Polls
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
