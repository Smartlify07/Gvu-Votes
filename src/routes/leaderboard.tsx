import { createFileRoute } from "@tanstack/react-router"
import { useContestants, CONTESTANTS_QUERY_KEY } from "@/features/contestants/hooks"
import { useState, useEffect } from "react"
import { TitleSection } from "@/features/leaderboard/components/title-section"
import { PodiumTopThree } from "@/features/leaderboard/components/podium-top-three"
import { FilterTabs } from "@/features/leaderboard/components/filter-tabs"
import { LeaderboardList } from "@/features/leaderboard/components/leaderboard-list"
import { Navbar } from "@/components/navbar"
import { Spinner } from "@/components/ui/spinner"
import { supabase } from "@/lib/supabase"
import { useQueryClient } from "@tanstack/react-query"

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
})

function LeaderboardPage() {
  const { data, isPending } = useContestants()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const queryClient = useQueryClient()

  const contestants = data ?? []

  useEffect(() => {
    const channel = supabase
      .channel("leaderboard-votes-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: CONTESTANTS_QUERY_KEY })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

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
            <Spinner />
          </div>
        ) : (
          <LeaderboardList contestants={contestants} category={selectedCategory} />
        )}
      </main>
    </div>
  )
}