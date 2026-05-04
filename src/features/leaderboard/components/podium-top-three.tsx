import { type ContestantWithVotes } from "@/features/contestants/api"

export type PodiumItemProps = {
  contestant: ContestantWithVotes
  rank: number
}

function PodiumItem({ contestant, rank }: PodiumItemProps) {
  const heightClass = rank === 1 
    ? "h-32" 
    : rank === 2 
      ? "h-24" 
      : "h-20"

  const voteCount = contestant.votes?.[0]?.count ?? 0

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className={`${rank === 1 ? "w-20 h-20" : "w-16 h-16"} rounded-full overflow-hidden`}>
        <img
          src={contestant.avatarUrl}
          alt={contestant.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Name */}
      <div className="text-center">
        <p className={`font-medium ${rank === 1 ? "text-lg" : "text-base"}`}>
          {contestant.name}
        </p>
        <p className="text-xs text-muted-foreground">{contestant.department}</p>
      </div>

      {/* Vote count */}
      <p className={`font-bold ${rank === 1 ? "text-2xl" : "text-xl"}`}>
        {voteCount.toLocaleString()}
      </p>

      {/* Podium block */}
      <div className={`w-24 ${heightClass} bg-yellow-500 rounded-t-lg flex items-end justify-center pb-2`}>
        <span className="text-white font-bold text-sm">#{rank}</span>
      </div>
    </div>
  )
}

export type PodiumTopThreeProps = {
  contestants: ContestantWithVotes[]
}

export function PodiumTopThree({ contestants }: PodiumTopThreeProps) {
  const sorted = [...contestants]
    .sort((a, b) => (b.votes?.[0]?.count ?? 0) - (a.votes?.[0]?.count ?? 0))
    .slice(0, 3)

  if (sorted.length === 0) {
    return null
  }

  return (
    <section className="flex items-end justify-center gap-4 py-8">
      {/* 2nd place */}
      {sorted[1] && (
        <div className="flex flex-col justify-end">
          <PodiumItem contestant={sorted[1]} rank={2} />
        </div>
      )}

      {/* 1st place */}
      {sorted[0] && (
        <div className="flex flex-col justify-end">
          <PodiumItem contestant={sorted[0]} rank={1} />
        </div>
      )}

      {/* 3rd place */}
      {sorted[2] && (
        <div className="flex flex-col justify-end">
          <PodiumItem contestant={sorted[2]} rank={3} />
        </div>
      )}
    </section>
  )
}