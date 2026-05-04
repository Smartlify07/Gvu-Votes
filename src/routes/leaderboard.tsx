import { createFileRoute, Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { useContestants } from "@/features/contestants/hooks"
import { useState } from "react"
import { Crown, ArrowLeft } from "lucide-react"
import { TitleSection } from "@/features/leaderboard/components/title-section"
import { PodiumTopThree } from "@/features/leaderboard/components/podium-top-three"
import { FilterTabs } from "@/features/leaderboard/components/filter-tabs"
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list"

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const { data, isPending } = useContestants()
  const [selectedCategory, setSelectedCategory] = useState("All")

  const contestants = data?.data ?? []

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Link>
        <Link to="/" className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <span className="font-bold">GVU Votes</span>
        </Link>
        <Button variant="ghost" size="sm">
          <Link to="/register">Register</Link>
        </Button>
      </header>

      <main className="container mx-auto flex flex-col gap-8 px-4 py-8">
        {/* Title Section */}
        <TitleSection />

        {/* Podium Top Three */}
        {!isPending && contestants.length > 0 && (
          <PodiumTopThree contestants={contestants} />
        )}

        {/* Filter Tabs */}
        <FilterTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Leaderboard List */}
        {isPending ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
          </div>
        ) : (
          <LeaderboardList contestants={contestants} category={selectedCategory} />
        )}
      </main>
    </div>
  )
}