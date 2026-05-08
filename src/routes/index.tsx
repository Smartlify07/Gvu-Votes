import { createFileRoute, Link } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContestantsList } from "@/features/contestants/components/contestants-list"
import { useCategories, useContestants, useTotalVotes } from "@/features/contestants/hooks"
import { Trophy, Users, Vote, ArrowRight, Crown, Sparkles } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/")({ component: App })

function App() {
  const { data: contestantsData, isPending } = useContestants()
  const { data: categories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState("All")

  const totalContestants = contestantsData?.length ?? 0
  const { data: totalVotes, isPending: isTotalVotesPending } = useTotalVotes()
  console.log(totalVotes)
  const totalPositions = categories?.length ?? 0

  const scrollToContestants = () => {
    document.getElementById("contestants")?.scrollIntoView({ behavior: "smooth" })
  }
  const categoryFilters = [
    { label: "All", value: "All" },
    ...(categories?.map((c) => ({ label: c.label, value: c.id })) ?? []),
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
        <div className="flex flex-col items-center gap-6 max-w-3xl">
          <Badge variant="secondary" className="gap-2 px-4 h-8 py-3 text-base">
            <Sparkles className="" size={20} />
            2026 Edition
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight lg:text-6xl">
            Vote for Your Next
            <span className="text-yellow-500"> GVU Royalty</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl">
            Join the most exciting campus election experience.
            Register as a contestant or cast your vote for your favorite candidate.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Link className={cn(buttonVariants({ variant: "default", size: "lg" }), "text-base")} to="/register">
              Register as Contestant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Button size="lg" variant="outline" onClick={scrollToContestants}>
              Cast Your Vote
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <Users className="h-8 w-8 text-yellow-500" />
            <div className="text-3xl font-bold">{totalContestants}</div>
            <div className="text-sm text-muted-foreground">Total Contestants</div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <Vote className="h-8 w-8 text-yellow-500" />
            <div className="text-3xl font-bold">{isTotalVotesPending ? 0 : totalVotes?.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div className="text-3xl font-bold">{totalPositions}</div>
            <div className="text-sm text-muted-foreground">Positions</div>
          </div>
        </div>
      </section>

      {/* Meet the Contestants Section */}
      <section id="contestants" className="py-16 px-6 scroll-mt-24">
        <div className="mx-auto flex flex-col gap-8 max-w-7xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-3xl font-bold">Meet the Contestants</h2>
            <p className="text-muted-foreground">
              Get to know the amazing candidates vying for the crown this year
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {categoryFilters.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="rounded-full"
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Contestants List */}
          {isPending ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-current border-t-transparent" />
            </div>
          ) : (
            <ContestantsList category={selectedCategory} />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="mx-auto flex flex-col items-center justify-between gap-4 max-w-8xl sm:flex-row">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">GVU Votes</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 GVU Votes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}