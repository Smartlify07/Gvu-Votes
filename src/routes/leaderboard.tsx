import { createFileRoute } from "@tanstack/react-router"
import { useContestants } from "@/features/contestants/hooks"
import { useState } from "react"
import { TitleSection } from "@/features/leaderboard/components/title-section"
import { PodiumTopThree } from "@/features/leaderboard/components/podium-top-three"
import { FilterTabs } from "@/features/leaderboard/components/filter-tabs"
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const { data, isPending } = useContestants()
  const [selectedCategory, setSelectedCategory] = useState("All")

  const contestants = data?.data ?? []

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto flex flex-col gap-8 px-4 py-8 pt-32">
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