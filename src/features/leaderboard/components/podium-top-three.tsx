import { type ContestantWithVotes } from "@/features/contestants/api"

export type PodiumItemProps = {
  contestant: ContestantWithVotes
  rank: number
}

function PodiumItem({ contestant, rank }: PodiumItemProps) {
  const voteCount = contestant.votes_count ?? 0

  const podiumWidthClass = rank === 1
    ? "w-32 md:w-40"
    : "w-24 md:w-32"

  const heightClass = rank === 1
    ? "h-24 md:h-32"
    : rank === 2
      ? "h-20 md:h-24"
      : "h-16 md:h-20"

  const avatarClass = rank === 1
    ? "w-16 md:w-20 h-16 md:h-20"
    : "w-12 md:w-16 h-12 md:h-16"

  const textClass = rank === 1
    ? "text-xl md:text-2xl"
    : "text-base md:text-xl"

  return (
    <div className="flex flex-col items-center gap-2 md:gap-3">
      {/* Avatar */}
      <div className={`${avatarClass} rounded-full overflow-hidden`}>
        <img
          src={contestant.avatarUrl}
          alt={contestant.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Name */}
      <div className="text-center max-w-[100px] md:max-w-[120px]">
        <p className={`font-medium truncate ${rank === 1 ? "text-sm md:text-base" : "text-xs md:text-sm"}`}>
          {contestant.name}
        </p>
        <p className="text-[10px] md:text-xs text-muted-foreground truncate">
          {contestant.department}
        </p>
      </div>

      {/* Vote count */}
      <p className={`font-bold ${textClass}`}>
        {voteCount.toLocaleString()} votes
      </p>

      {/* Podium block */}
      <div className={`${podiumWidthClass} ${heightClass} bg-yellow-500 rounded-t-lg flex items-end justify-center pb-1 md:pb-2`}>
        <span className="text-white font-bold text-sm md:text-xl">#{rank}</span>
      </div>
    </div>
  )
}

export type PodiumTopThreeProps = {
  contestants: ContestantWithVotes[]
}

export function PodiumTopThree({ contestants }: PodiumTopThreeProps) {
  const sorted = [...contestants]
    .sort((a, b) => (b.votes_count ?? 0) - (a.votes_count ?? 0))
    .slice(0, 3)

  if (sorted.length === 0) {
    return null
  }

  return (
    <section className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 lg:gap-10 py-6 md:py-8 px-4">
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