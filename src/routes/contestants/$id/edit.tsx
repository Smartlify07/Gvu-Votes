import { createFileRoute } from "@tanstack/react-router"
import { EditContestantForm } from "@/features/contestants/components/edit-form"
import { Navbar } from "@/components/navbar"

export const Route = createFileRoute("/contestants/$id/edit")({
  component: EditContestantPage,
})

function EditContestantPage() {
  const { id } = Route.useParams()

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="flex items-center min-h-screen justify-center p-4 md:p-12 pt-24 md:pt-28">
        <div className="w-full lg:max-w-2xl">
          <EditContestantForm contestantId={id} />
        </div>
      </div>
    </div>
  )
}