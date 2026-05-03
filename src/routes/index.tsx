import { createFileRoute, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/components/ui/button"
import { ContestantsList } from "@/features/contestants/components/contestants-list"

export const Route = createFileRoute("/")({ component: App })

function App() {
  return (
    <div className="flex min-h-svh items-center p-12">
      <section className="flex w-full flex-col gap-6">
        <div className="flex items-center justify-between">

          <h1 className="text-center text-3xl font-medium">
            Vote for your spec!
          </h1>

          <Link to="/register" className={buttonVariants({ variant: "default", })}>Register as a contestant</Link>
        </div>
        <ContestantsList />
      </section>
    </div>
  )
}
