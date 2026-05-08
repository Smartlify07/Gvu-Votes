import { OptimizedImage } from "@/components/ui/optimized-image"
import { type ContestantWithVotes } from "@/features/contestants/api"
import { Trophy } from "lucide-react"
import { Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { useCategories } from "@/features/contestants/hooks"

export type LeaderboardItemProps = {
  contestant: ContestantWithVotes
  rank: number
  maxVotes: number
}

function LeaderboardItem({ contestant, rank, maxVotes }: LeaderboardItemProps) {
  const voteCount = contestant.votes_count ?? 0
  const progressWidth = maxVotes > 0 ? (voteCount / maxVotes) * 100 : 0

  const rankDisplay = rank <= 3 ? (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${rank === 1 ? "bg-yellow-500 text-white" :
      rank === 2 ? "bg-gray-400 text-white" :
        "bg-amber-700 text-white"
      }`}>
      <Trophy className="h-4 w-4" />
    </div>
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
      {rank}
    </div>
  )

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      {/* Rank */}
      <div className="shrink-0">
        {rankDisplay}
      </div>

      {/* Avatar */}
      <OptimizedImage
        src={contestant.avatarUrl}
        alt={contestant.name}
        className="h-full w-full object-cover"
        containerClassName="h-12 w-12 shrink-0 rounded-full"
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{contestant.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {contestant.category_label} • {contestant.department}
        </p>
      </div>

      {/* Progress bar */}
      <div className="hidden sm:block w-32">
        <div className="h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-yellow-500"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Vote count */}
      <div className="shrink-0 text-right">
        <p className="font-bold">{voteCount.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">votes</p>
      </div>
    </div>
  )
}

export type LeaderboardListProps = {
  contestants: ContestantWithVotes[]
  category: string
}

export function LeaderboardList({ contestants, category }: LeaderboardListProps) {
  const filtered = category === "All"
    ? contestants
    : contestants.filter((c) => c.category_id === category)

  const sorted = [...filtered]
    .sort((a, b) => (b.votes_count ?? 0) - (a.votes_count ?? 0))

  const maxVotes = sorted[0]?.votes_count ?? 0
  const { data: categories } = useCategories()
  const foundCategory = categories?.find((cat) => cat.id === category);
  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <p className="text-lg font-medium">No contestants yet</p>
        <p className="text-sm text-muted-foreground">
          Be the first to register for {foundCategory?.label}!
        </p>
        <Link to="/register" className={buttonVariants()}>
          Register Now
        </Link>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      {sorted.map((contestant, index) => (
        <LeaderboardItem
          key={contestant.id}
          contestant={contestant}
          rank={index + 1}
          maxVotes={maxVotes}
        />
      ))}
    </section>
  )
}