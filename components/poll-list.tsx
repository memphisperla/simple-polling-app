import { getPolls } from "@/app/actions"
import PollCard from "@/components/poll-card"

export default async function PollList() {
  const polls = await getPolls()

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No polls created yet.</p>
        <p className="text-gray-400 mt-2">Create your first poll to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  )
}
