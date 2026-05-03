import { createFileRoute, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { ContestantsList } from "@/features/contestants/components/contestants-list"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="flex min-h-svh p-6 lg:p-12">
      <section className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-start lg:items-center justify-between">

          <h1 className="lg:text-center text-3xl font-medium">
            Vote for your spec!
          </h1>

          <Link to="/register" className={cn(buttonVariants({ variant: "default", }), "self-start lg:self-stretch")}>Register as a contestant</Link>
        </div>
        <ContestantsList />
      </section>
    </div>
  )
}
