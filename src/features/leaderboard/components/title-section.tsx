import { Crown } from "lucide-react"

export function TitleSection() {
  return (
    <section className="flex flex-col items-center gap-2 text-center">
      <Crown className="h-10 w-10 text-yellow-500" />
      <h1 className="text-3xl font-bold lg:text-4xl">Leaderboard</h1>
      <p className="text-muted-foreground">
        See how your favorite contestants are performing
      </p>
    </section>
  )
}